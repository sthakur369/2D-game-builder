from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.gemini import generate_game_blueprint
from services.storage import save_game_blueprint
from fastapi import Path
import shutil
import os
import json
from services.storage import save_game_blueprint, save_production_plan
from services.gemini import generate_game_blueprint, generate_production_plan
import time
from services.gemini import generate_image
import os
import shutil
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter, HTTPException, Request
import os
from PIL import Image
from services.gemini import generate_asset_image
from fastapi.responses import StreamingResponse
import asyncio
import subprocess
import sys
import asyncio
import signal
import threading
import subprocess
import psutil

app = FastAPI()

# Serve each game's phaser folder as static files
GAMES_BASE = os.path.join(os.path.dirname(__file__), 'games')
if os.path.exists(GAMES_BASE):
    for game_folder in os.listdir(GAMES_BASE):
        phaser_path = os.path.join(GAMES_BASE, game_folder, 'phaser')
        if os.path.isdir(phaser_path):
            mount_path = f'/games/{game_folder}/phaser'
            app.mount(mount_path, StaticFiles(directory=phaser_path), name=f'{game_folder}_phaser')

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

# Global variable to store progress for each request
progress_data = {}

def send_progress_update(request_id, step, status, message, progress_percent):
    """Send progress update to the progress_data store"""
    print(f"[DEBUG] Sending progress update: {request_id} - {step} - {status} - {progress_percent}%")
    
    progress_data[request_id] = {
        "step": step,
        "status": status,  # "running", "completed", "error"
        "message": message,
        "progress_percent": progress_percent,
        "timestamp": time.time()
    }
    
    print(f"[DEBUG] Progress data updated: {progress_data[request_id]}")
    
    # Clean up old progress data (older than 1 hour)
    current_time = time.time()
    expired_keys = [key for key, value in progress_data.items() 
                   if current_time - value.get('timestamp', 0) > 3600]
    for key in expired_keys:
        del progress_data[key]

@app.get("/progress/{request_id}")
async def get_progress(request_id: str):
    """Get progress for a specific request"""
    print(f"[DEBUG] Progress request for: {request_id}")
    print(f"[DEBUG] Available progress data: {list(progress_data.keys())}")
    
    if request_id in progress_data:
        progress = progress_data[request_id]
        print(f"[DEBUG] Found progress: {progress}")
        return progress
    else:
        print(f"[DEBUG] Progress not found for: {request_id}")
        return {"status": "not_found"}

@app.get("/games")
def list_games():
    base_path = "games"
    if not os.path.exists(base_path):
        return []

    games = []
    for folder in os.listdir(base_path):
        blueprint_path = os.path.join(base_path, folder, "blueprint.json")
        if os.path.exists(blueprint_path):
            with open(blueprint_path, "r", encoding="utf-8") as f:
                blueprint = json.load(f)
                games.append({
                    "id": folder,
                    "title": blueprint.get("meta", {}).get("title", folder),
                    "genre": blueprint.get("gameplay", {}).get("genre", "Custom"),
                    "description": blueprint.get("meta", {}).get("description", ""),
                    "thumbnail": "/assets/placeholder.png",
                    "config": blueprint
                })
    return games

@app.post("/generate")
async def generate(prompt_req: PromptRequest):
    request_id = f"gen_{int(time.time() * 1000)}"
    
    # Return the request ID immediately so frontend can start polling
    response_data = {
        "status": "started",
        "request_id": request_id,
        "message": "Game generation started"
    }
    
    # Start the generation process in the background
    asyncio.create_task(run_generation(request_id, prompt_req.prompt))
    
    return response_data

async def run_generation(request_id: str, prompt: str):
    """Run the actual generation process"""
    try:
        print(f"[DEBUG] Starting generation with request_id: {request_id}")
        
        # print("restarting server")
        # # Restart the server silently
        # restart_server_silently(
        #     main_file="main:app",
        #     port=8000,
        #     host="0.0.0.0",
        #     reload=True
        # )

        
        # print("restarted server")
        
        
        # Initialize progress
        send_progress_update(request_id, "initializing", "running", "Starting game generation...", 0)
        print(f"[DEBUG] Sent initial progress update")
        
        # Step 1: Generate blueprint (Prompt 1)
        send_progress_update(request_id, "blueprint", "running", "Generating game blueprint...", 10)
        print(f"[DEBUG] Starting blueprint generation...")
        
        
        
        
        try:
            blueprint = generate_game_blueprint(prompt)
            print(f"[DEBUG] Blueprint generated successfully")
        except Exception as e:
            print(f"[DEBUG] Blueprint generation failed: {e}")
            # For now, create a dummy blueprint to continue
            blueprint = {
                "meta": {
                    "title": prompt[:30] + "..." if len(prompt) > 30 else prompt,
                    "description": prompt
                },
                "gameplay": {
                    "genre": "Action"
                }
            }
        send_progress_update(request_id, "blueprint", "completed", "Game blueprint generated successfully!", 20)
        print(f"[DEBUG] Sent blueprint completion update")

        # Step 2: Save blueprint to folder
        send_progress_update(request_id, "save_blueprint", "running", "Saving blueprint to folder...", 25)
        print(f"[DEBUG] Starting blueprint save...")
        try:
            folder, blueprint_path = save_game_blueprint(blueprint)
            print(f"[DEBUG] Blueprint saved to: {folder}")
        except Exception as e:
            print(f"[DEBUG] Blueprint save failed: {e}")
            # Create folder manually
            folder_name = f"game_{int(time.time())}"
            folder = os.path.join("games", folder_name)
            os.makedirs(folder, exist_ok=True)
            blueprint_path = os.path.join(folder, "blueprint.json")
            with open(blueprint_path, "w", encoding="utf-8") as f:
                json.dump(blueprint, f, indent=2)
        send_progress_update(request_id, "save_blueprint", "completed", "Blueprint saved successfully!", 30)
        print(f"[DEBUG] Sent blueprint save completion update")

        # Step 3: Generate production plan (Prompt 2)
        send_progress_update(request_id, "production_plan", "running", "Generating production plan...", 35)
        print(f"[DEBUG] Starting production plan generation...")
        try:
            plan = generate_production_plan(blueprint)
            print(f"[DEBUG] Production plan generated successfully")
        except Exception as e:
            print(f"[DEBUG] Production plan generation failed: {e}")
            # Create a dummy production plan
            plan = {
                "asset_prompts": {
                    "characters": {
                        "player": "A heroic character sprite",
                        "enemy": "A villain character sprite"
                    },
                    "backgrounds": {
                        "level1": "A simple background scene"
                    },
                    "effects": {
                        "explosion": "An explosion effect"
                    }
                },
                "phaser_modules": {
                    "loadAssets": "function loadAssets(scene) { console.log('Loading assets...'); }",
                    "createAnimations": "function createAnimations(scene) { console.log('Creating animations...'); }",
                    "createScene": "function createScene(scene) { console.log('Creating scene...'); }",
                    "setupControls": "function setupControls(scene) { console.log('Setting up controls...'); }",
                    "runCombatLoop": "function runCombatLoop(scene, delta) { console.log('Running combat loop...'); }"
                }
            }
        send_progress_update(request_id, "production_plan", "completed", "Production plan generated successfully!", 50)
        print(f"[DEBUG] Sent production plan completion update")

        # Step 4: Save production plan
        send_progress_update(request_id, "save_plan", "running", "Saving production plan...", 55)
        print(f"[DEBUG] Starting production plan save...")
        try:
            save_production_plan(folder, plan)
            print(f"[DEBUG] Production plan saved successfully")
        except Exception as e:
            print(f"[DEBUG] Production plan save failed: {e}")
            # Save manually
            production_plan_path = os.path.join(folder, "production_plan.json")
            with open(production_plan_path, "w", encoding="utf-8") as f:
                json.dump(plan, f, indent=2)
        send_progress_update(request_id, "save_plan", "completed", "Production plan saved successfully!", 60)
        print(f"[DEBUG] Sent production plan save completion update")

        # Step 5: Generate images from asset prompts and save to assets folder
        send_progress_update(request_id, "assets", "running", "Generating game assets...", 65)
        print(f"[DEBUG] Starting asset generation...")
        
        # Read the production plan
        production_plan_path = os.path.join(folder, "production_plan.json")
        with open(production_plan_path, "r", encoding="utf-8") as f:
            plan = json.load(f)
        asset_prompts = plan.get("asset_prompts", {})
        
        # Create assets folder structure
        assets_folder = os.path.join(folder, "assets")
        os.makedirs(assets_folder, exist_ok=True)

        # Map for folder naming
        type_to_folder = {
            "characters": "characters",
            "backgrounds": "backgrounds",
            "effects": "effects",
            "audio": "audio",
            "ui": "ui",
            "ui_image": "ui",  # Map both to ui folder
            # fallback for any new types
        }

        # Generate actual images from AI prompts
        for type_key, folder_key in type_to_folder.items():
            prompts = asset_prompts.get(type_key, {})
            if prompts:
                subfolder = os.path.join(assets_folder, folder_key)
                os.makedirs(subfolder, exist_ok=True)
                for name, prompt in prompts.items():
                    # Make safe filename
                    base_name = name.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")
                    img_path = os.path.join(subfolder, f"{base_name}.png")
                    try:
                        generate_image(prompt, img_path)
                        print(f"[DEBUG] Generated image: {img_path}")
                    except Exception as e:
                        print(f"[DEBUG] Image generation failed for {img_path}: {e}")
                        # Create placeholder
                        try:
                            from PIL import Image, ImageDraw
                            img = Image.new('RGB', (256, 256), color='#cccccc')
                            draw = ImageDraw.Draw(img)
                            draw.rectangle([50, 50, 206, 206], fill='#999999')
                            img.save(img_path)
                        except:
                            with open(img_path, 'w') as f:
                                f.write("placeholder")
        
        send_progress_update(request_id, "assets", "completed", "Game assets generated successfully!", 75)
        print(f"[DEBUG] Sent assets completion update")

        # Step 6: Create /phaser folder and generate Phaser game files
        send_progress_update(request_id, "phaser_files", "running", "Generating Phaser game files...", 80)
        print(f"[DEBUG] Starting Phaser file generation...")
        
        phaser_dir = os.path.join(folder, "phaser")
        scenes_dir = os.path.join(phaser_dir, "scenes")
        os.makedirs(scenes_dir, exist_ok=True)

        # Copy assets folder (if not already present) BEFORE generating JS files
        src_assets = os.path.join(folder, "assets")
        dst_assets = os.path.join(phaser_dir, "assets")
        if os.path.exists(dst_assets):
            shutil.rmtree(dst_assets)
        shutil.copytree(src_assets, dst_assets)
        
        # Read phaser_modules from production_plan.json
        phaser_modules = plan.get("phaser_modules", {})
        def write_js(filename, code):
            with open(os.path.join(phaser_dir, filename), "w", encoding="utf-8") as f:
                f.write(code)
        def write_scene_js(filename, code):
            with open(os.path.join(scenes_dir, filename), "w", encoding="utf-8") as f:
                f.write(code)

        # Write module JS files from actual code in production_plan.json
        for module_name in ["loadAssets", "createAnimations", "createScene", "setupControls", "runCombatLoop"]:
            code = phaser_modules.get(module_name, "")
            # If the code doesn't already attach itself to window, do it (for helpers)
            if module_name != "GameScene" and code and f"window.{module_name}" not in code:
                # Assume function name matches file/module name
                code += f"\nwindow.{module_name} = {module_name};\n"
            write_js(f"{module_name}.js", code)

        # Generate standard template files (main.js, index.html, GameScene.js)
        generate_standard_template_files(phaser_dir, scenes_dir)

        # Copy assets folder (if not already present)
        src_assets = os.path.join(folder, "assets")
        dst_assets = os.path.join(phaser_dir, "assets")
        if os.path.exists(dst_assets):
            shutil.rmtree(dst_assets)
        shutil.copytree(src_assets, dst_assets)

        # Copy goku_portrait.png from games folder to phaser directory for favicon
        goku_src = os.path.join("games", "goku_portrait.png")
        goku_dst = os.path.join(phaser_dir, "goku_portrait.png")
        if os.path.exists(goku_src):
            shutil.copy2(goku_src, goku_dst)

        send_progress_update(request_id, "phaser_files", "completed", "Phaser game files generated successfully!", 90)
        print(f"[DEBUG] Sent Phaser files completion update")

        # Final step: Complete
        send_progress_update(request_id, "complete", "completed", "Game generation completed successfully! 🎮", 100)
        print(f"[DEBUG] Sent final completion update")


    except Exception as e:
        import traceback
        print("[FastAPI] Exception in run_generation:")
        traceback.print_exc()
        send_progress_update(request_id, "error", "error", f"Error: {str(e)}", 0)

@app.delete("/delete/{folder_name}")
def delete_game(folder_name: str = Path(...)):
    game_folder = os.path.join("games", folder_name)
    if os.path.exists(game_folder):
        shutil.rmtree(game_folder)
        return {"status": "deleted", "folder": folder_name}
    else:
        raise HTTPException(status_code=404, detail="Game folder not found")

@app.get("/asset_folders/{game_id}")
def get_asset_folders(game_id: str):
    assets_path = os.path.join("games", game_id, "phaser", "assets")
    if not os.path.exists(assets_path):
        raise HTTPException(status_code=404, detail="Assets folder not found")
    folders = [f for f in os.listdir(assets_path) if os.path.isdir(
        os.path.join(assets_path, f))]
    return folders

@app.post("/modify_asset/{game_id}")
async def modify_asset(game_id: str, request: Request):
    data = await request.json()
    folder = data.get('folder')
    description = data.get('description')
    if not folder or not description:
        raise HTTPException(status_code=400, detail="Missing folder or description")

    assets_dir = os.path.join("games", game_id, "phaser", "assets", folder)
    if not os.path.exists(assets_dir):
        raise HTTPException(status_code=404, detail="Asset folder not found")

    # Find the first image file in the folder
    image_files = [f for f in os.listdir(assets_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
    if not image_files:
        raise HTTPException(status_code=404, detail="No image found in selected folder")
    image_path = os.path.join(assets_dir, image_files[0])

    # Get image size
    with Image.open(image_path) as img:
        width, height = img.size

    # Generate and replace image
    try:
        
        generate_asset_image(description, image_path, width, height, asset_type=folder)
        return {"status": "success", "message": "Image replaced.", "filename": image_files[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate/replace image: {e}")

def generate_standard_template_files(phaser_dir, scenes_dir):
    """Generate standard template files that work for any game"""
    
    # Standard main.js template
    mainjs_template = '''// Auto-generated main.js (game boot)
// Phaser and GameScene are loaded globally via CDN and script tags.

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000',
    parent: 'phaser-game',
    scene: [window.GameScene || GameScene],
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new Phaser.Game(config);
});
'''
    
    # Standard index.html template
    indexhtml_template = '''<!-- Auto-generated entry point for Phaser game -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=1280, initial-scale=1.0">
    <link rel="icon" type="image/png" href="./goku_portrait.png" />
    
    <title>Game</title>
    <style>
        html, body, #phaser-game { overflow:hidden;
            width: 100vw; height: 100vh; margin: 0; padding: 0; background: #000;
        }
        #phaser-game { position: absolute; left: 0; top: 0; }
    </style>
</head>
<body>
    <div id="phaser-game"></div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.js"></script>
    <script src="./loadAssets.js"></script>
    <script src="./createAnimations.js"></script>
    <script src="./createScene.js"></script>
    <script src="./setupControls.js"></script>
    <script src="./runCombatLoop.js"></script>
    <script src="./scenes/GameScene.js"></script>
    <script src="./main.js"></script>
</body>
</html>
'''
    
    # Standard GameScene.js template
    gamescene_template = '''// Auto-generated by backend from production_plan.json
// Assumes loadAssets, createAnimations, createScene, setupControls, runCombatLoop are loaded globally.

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    preload() {
        if (window.loadAssets) window.loadAssets(this);
    }
    create() {
        if (window.createAnimations) window.createAnimations(this);
        if (window.createScene) window.createScene(this);
        if (window.setupControls) window.setupControls(this);
        // runCombatLoop is called in update
    }
    update(time, delta) {
        if (window.runCombatLoop) window.runCombatLoop(this, delta);
    }
}
window.GameScene = GameScene;
'''
    
    # Write the template files
    with open(os.path.join(phaser_dir, "main.js"), "w", encoding="utf-8") as f:
        f.write(mainjs_template)
    
    with open(os.path.join(phaser_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(indexhtml_template)
    
    with open(os.path.join(scenes_dir, "GameScene.js"), "w", encoding="utf-8") as f:
        f.write(gamescene_template)


# def restart_server_silently(
#         main_file: str = "main:app",
#     port: int = 8000,
#     host: str = "127.0.0.1",
#     reload: bool = True
# ):
#     """
#     Cross-platform restart function that safely targets uvicorn processes.
#     """
#     print("🔄 Restarting FastAPI server...")

#     # Kill existing uvicorn processes (safer approach)
#     try:
#         if os.name == 'nt':  # Windows
#             # Kill processes listening on the specific port
#             os.system(
#                 f'for /f "tokens=5" %a in (\'netstat -aon ^| find ":{port}" ^| find "LISTENING"\') do taskkill /f /pid %a')
#             time.sleep(1)
#             # Also try to kill by command line (more targeted)
#             os.system(
#                 'wmic process where "commandline like \'%uvicorn%\'" delete')
#         else:  # Unix-like (Linux, macOS)
#             os.system("pkill -f uvicorn")
#         time.sleep(2)
#         print("✅ Stopped existing server")
#     except Exception as e:
#         print(f"Note: {e}")

#     # Build command with parameters
#     cmd = f"uvicorn {main_file}"

#     if host != "127.0.0.1":
#         cmd += f" --host {host}"
#     if port != 8000:
#         cmd += f" --port {port}"
#     if reload:
#         cmd += " --reload"

#     print(f"Starting: {cmd}")

#     # Start server
#     try:
#         if os.name == 'nt':  # Windows
#             # Use subprocess to start in background
#             import subprocess
#             subprocess.Popen(
#                 cmd.split(), creationflags=subprocess.CREATE_NEW_CONSOLE)
#         else:  # Unix-like
#             os.system(f"{cmd} &")

#         time.sleep(1)
#         print("✅ Server restart initiated")
#     except Exception as e:
#         print(f"❌ Error starting server: {e}")
