# uvicorn main:app --reload

import requests
import os
import json
import re
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64


API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyChYBrCx63yd9ijqg0pLfaY_SaK-UskN3U")
client = genai.Client(api_key=API_KEY)

def safe_json_loads(json_text: str) -> dict:
    """
    Safely loads JSON from a string, handling potential errors.
    """
    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        raise ValueError(f"Failed to parse JSON: {json_text[:500]}...") from e

def extract_json_from_markdown(text: str) -> str:
    """
    Extracts JSON content from markdown code blocks.
    """
    # Look for ```json...``` blocks
    json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
    if json_match:
        return json_match.group(1).strip()
    
    # Look for ```...``` blocks (without json specifier)
    code_match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    
    # If no code blocks found, return the original text
    return text.strip()

def generate_game_blueprint(prompt: str) -> dict:
    """
    Generates a game blueprint based on the provided prompt.
    """
    print("[Gemini] Generating game blueprint...")
    if not API_KEY:
        raise ValueError("API key not found in environment variables.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    body = {
        "contents": [{
            "parts": [{
                "text": f"""
You are an AI Game Designer Assistant responsible for generating the structure and configuration of a **high-quality 2D browser-based game** based on user input.

The game will be built using the following tech stack:
- **Game Engine**: [Phaser.js] – handles rendering, movement, physics, animations.
- **Backend**: [FastAPI (Python)] – used to parse prompt, generate configuration, connect with AI models, and serve assets or logic to frontend.
- **Frontend UI/UX**: [React + TailwindCSS] – used for in-game UI (menus, health bars, prompt input box, settings). UX should be responsive, modern, and clean.
- **Asset Generation**: [Leonardo.ai or Scenario.gg] – used to create character sprite sheets, backgrounds, attack FX, and other 2D visuals.
- **Deployment**: [Vercel or Netlify (frontend)], [Render or Railway (backend)], [Cloudinary or S3] for storing and serving generated assets.

---
## Objective
Your job is to take the user's game request and break it down into a structured config that can be used to generate and assemble the 2D game in the stack described above. The game must be:
- **Playable directly in the browser**
- **Visually polished**, with high-quality 2D assets and smooth transitions
- Designed with a **high-quality UI/UX mindset**

---
## INPUT (from user)
> "{prompt}"

---
## OUTPUT FORMAT (JSON ONLY)
Return a structured config (in JSON format) with these sections:
### 1. meta
- "title": Title of the game
- "description": Short game concept
- "style": Art style (e.g., anime, pixel-art, realistic)
### 2. characters (Array)
Each character should include:
- "name"
- "sprite_request": Description to generate sprite sheet (used by Leonardo.ai)
- "moves": List of actions (e.g., punch, kick, fireball)
- "controls": Keys (e.g., "WASD", "Space for attack")
### 3. scene
- "background_request": Describe background image to generate
- "weather" (optional): Add FX like fog, snow, night
- "music": Theme/genre of background music
- "lighting": Day/night, dark/light tones
### 4. gameplay
- "genre": Fighting / RPG / Platformer / Shooter
- "physics": Gravity, jump height, speed
- "camera": Follow player, fixed
- "win_condition": Time-based, health depletion, combo score
### 5. ui_ux
- "ui_theme": Describe the style (e.g., neon tech, minimal anime)
- "hud": What to show (e.g., health bar, power bar, combo count)
- "menus": Start menu, pause, character select
- "responsiveness": Should be mobile + desktop optimized
- "animations": Transitions between menus or attacks

---
## ADDITIONAL INSTRUCTIONS
- IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no explanations, no extra text.
- Ensure the **art and sprites are consistent in style** (anime if user said anime).
- Make the output compatible with **Phaser.js engine**.
- Prioritize **good UX/UI**, especially in the ui_ux section — avoid generic layouts.
- The generated config will be passed to another module that:
  - Generates assets via Leonardo.ai
  - Loads the game scene in Phaser
  - Injects UI using React
You are not building the game yourself — you're providing a perfect, readable **blueprint** that a code engine can consume.

CRITICAL: 
- Return ONLY valid JSON with proper escaping
- Use double quotes for all strings
- Escape all backslashes as double backslashes
- Do not use unescaped special characters
- Test that your JSON is valid before responding

---
## Sample Output (JSON ONlY)
{{
  "meta": {{
    "title": "Name of the game",
    "description": "Description of the game",
    "style": "anime"
  }},
  "characters": [...],
  "scene": {{
    "background_request": "...",
    "weather": "...",
    "music": "...",
    "lighting": "..."
  }},
  "gameplay": {{
    "genre": "...",
    "physics": {{ "gravity": 0.8, "jump_height": 200, "speed": 3.5 }},
    "camera": "fixed",
    "win_condition": "first to deplete enemy health bar"
  }},
  "ui_ux": {{
    "ui_theme": "...",
    "hud": ["health_bar"],
    "menus": ["start_screen"],
    "responsiveness": true,
    "animations": ["fade_in_menu"]
  }}
}}


"""
}]
}]
}



    headers = {
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(url, json=body, headers=headers)
        print(f"[Gemini] Status code: {res.status_code}")
        res.raise_for_status()
        data = res.json()

        raw_text = data['candidates'][0]['content']['parts'][0]['text']

        json_text = extract_json_from_markdown(raw_text)  

        try:
            parsed_json = safe_json_loads(json_text)
            print(f"[Gemini] Successfully parsed JSON with keys: {list(parsed_json.keys())}")
            return parsed_json
        except ValueError as e:
            print(f"[Gemini] Error parsing extracted JSON: {e}")
            raise

    except requests.exceptions.RequestException as e:
        print(f"[Gemini] RequestException: {e}")
        error_message = f"An error occurred while making the API request: {e}"
        if hasattr(e, 'response') and e.response is not None:
            error_message += f". Response text: {e.response.text}"
        raise ValueError(error_message) from e



def generate_production_plan(blueprint: dict) -> dict:
    """
    Generates a production plan based on the provided blueprint.
    """
    print("[Gemini] Generating production plan...")
    
    system_prompt = f"""
You are a Game Tech Architect AI. You will receive a JSON-based blueprint for a 2D browser-based game. This blueprint defines characters, scenes, gameplay logic, and UI structure.

Your task is to expand this into a full, AI-assisted technical production plan for a browser-playable game using the following stack:

- Phaser.js → for the game engine
- FastAPI (Python) → for backend logic, asset orchestration
- React + TailwindCSS → for frontend UI
- Gemini Image Generation Tool → for generating visual assets

This game will be deployed on the web. Prioritize:
- High-quality 2D graphics and animations
- Responsive UI/UX
- Dynamic, modular, and clean code structure

---

## INPUT JSON
{json.dumps(blueprint, indent=2, ensure_ascii=False)}

---
## YOUR TASKS

Use the input JSON to generate the following four output blocks:

---
### "asset_prompts"

Generate **highly detailed prompts** for each:
- Character (based on `sprite_request`)
- Background (from `background_request`)
- Special effects (e.g., "Kamehameha", "Galick Gun", combo FX)
- UI elements (e.g., portrait of character)

Each prompt should be suitable for Leonardo.ai or Scenario.gg and should include:
- View angle (e.g., side view or ¾)
- Pose or animation description
- Resolution (e.g., 512x512 for sprites, 1920x1080 for backgrounds)
- Background transparency for characters
- Style keywords (e.g., anime, pixel art, cel-shading, realistic)

**CRITICAL NAMING CONVENTIONS:**
- Characters: Use `character_name_spritesheet.png` format (e.g., `goku_ssj_spritesheet.png`)
- Effects: Use `effect_name_fx.png` format (e.g., `kamehameha_fx.png`)
- Backgrounds: Use `background_name.png` format (e.g., `battle_arena_desert.png`)
- UI: Use `ui_element.png` format (e.g., `goku_portrait.png`)

**Asset Specifications:**
- Character spritesheets: 512x512 pixels per frame, transparent background
- Effect spritesheets: 256x256 to 1024x512 pixels per frame, transparent background
- Backgrounds: 1920x1080 pixels
- UI elements: 256x256 pixels

Output format:
```json
{{
  "characters": {{
    "goku_ssj_spritesheet": "Prompt for sprite generation...",
    "vegeta_ssj_spritesheet": "Prompt for sprite generation..."
  }},
  "backgrounds": {{
    "battle_arena_desert": "Prompt for scene background..."
  }},
  "effects": {{
    "kamehameha_fx": "Prompt for fireball/energy effect...",
    "galick_gun_fx": "Prompt for beam or energy wave..."
  }},
  "ui": {{
    "goku_portrait": "Prompt for character portrait in anime style, 256x256px, close-up headshot, facing forward, neutral expression, suitable for game UI"
  }}
}}
```

### "phaser_modules"

Generate complete, working Phaser.js JavaScript code that runs immediately without manual fixes.

**CRITICAL REQUIREMENTS:**
- Use function declarations: `function loadAssets(scene) {{ ... }}`
- End each function with: `window.functionName = functionName;`
- Use relative asset paths: `'assets/characters/character_name.png'`
- Include console.log for debugging: `console.log("✅ functionName is running");`
- Use defensive null checks in runCombatLoop
- Do NOT load audio files unless they exist
- Keep physics simple: use `setGravityY(0)` for 2D fighting games
- Position characters at ground level: `scene.sys.game.config.height - 60`
- Use `setOrigin(0.5, 1)` to align character feet to ground

**Asset Naming Convention:**
- Characters: `character_name_spritesheet.png` (e.g., `goku_ssj_spritesheet.png`)
- Effects: `effect_name_fx.png` (e.g., `kamehameha_fx.png`)
- Backgrounds: `background_name.png` (e.g., `battle_arena_desert.png`)
- UI: `ui_element.png` (e.g., `goku_portrait.png`)

**Animation Structure:**
- Idle: single frame (start: 0, end: 0)
- Walk: 5 frames (start: 1, end: 5)
- Attack: 5 frames (start: 6, end: 10)
- Keep frameRate between 8-15 for smooth animation

**loadAssets() REQUIREMENTS:**
1. Function declaration with console.log
2. Load background: `scene.load.image('background_key', 'assets/backgrounds/background_name.png')`
3. Load each character: `scene.load.spritesheet('character_key', 'assets/characters/character_name_spritesheet.png', {{ frameWidth: 140, frameHeight: 218 }})`
4. Load UI: `scene.load.image('goku_portrait', 'goku_portrait.png')`
5. Window assignment: `window.loadAssets = loadAssets;`

**createAnimations() REQUIREMENTS:**
1. Function declaration with console.log
2. For each character, create 3 animations:
   - Idle: `scene.anims.create({{ key: 'character_idle', frames: scene.anims.generateFrameNumbers('character_key', {{ start: 0, end: 0 }}), frameRate: 1, repeat: -1 }})`
   - Walk: `scene.anims.create({{ key: 'character_walk', frames: scene.anims.generateFrameNumbers('character_key', {{ start: 1, end: 5 }}), frameRate: 10, repeat: -1 }})`
   - Punch: `scene.anims.create({{ key: 'character_punch', frames: scene.anims.generateFrameNumbers('character_key', {{ start: 6, end: 10 }}), frameRate: 15, repeat: 0 }})`
3. Window assignment: `window.createAnimations = createAnimations;`

**createScene() REQUIREMENTS:**
1. Function declaration with console.log
2. Add background: `scene.add.image(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2, 'background_key').setOrigin(0.5).setScrollFactor(0).setDepth(0)`
3. Setup world bounds: `scene.physics.world.setBounds(0, 0, 1920, 1080)`
4. Draw ground: `const graphics = scene.add.graphics(); graphics.fillStyle(0x654321, 1); graphics.fillRect(0, scene.sys.game.config.height - 60, scene.sys.game.config.width, 60)`
5. Create invisible ground for physics: `scene.ground = scene.add.rectangle(scene.sys.game.config.width / 2, scene.sys.game.config.height - 30, scene.sys.game.config.width, 60, 0x000000, 0); scene.physics.add.existing(scene.ground, true); scene.ground.body.allowGravity = false; scene.ground.body.immovable = true`
6. Create player: `scene.player = scene.physics.add.sprite(400, scene.sys.game.config.height - 60, 'player_character_key').setScale(1).setOrigin(0.5, 1).setDepth(10)`
7. Setup player physics: `scene.player.setCollideWorldBounds(true); scene.player.setGravityY(0); scene.player.setBounce(0.1); scene.player.setData('health', 1000); scene.player.play('player_idle')`
8. Create enemy with same structure but at `scene.sys.game.config.width - 400` position
9. Add collisions: `scene.physics.add.collider(scene.player, scene.ground); scene.physics.add.collider(scene.opponent, scene.ground); scene.physics.add.collider(scene.player, scene.opponent)`
10. Setup round delay: `scene.roundStarted = false; scene.time.delayedCall(2000, () => {{ scene.roundStarted = true; }}, null, scene)`
11. Setup camera: `scene.cameras.main.startFollow(scene.player, true, 0.05, 0.05)`
12. Create projectile groups
13. Add event listeners for health, energy, combo, round end
14. Window assignment: `window.createScene = createScene;`

**setupControls() REQUIREMENTS:**
1. Function declaration with console.log
2. Setup keys: `scene.keys = scene.input.keyboard.addKeys({{ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'left': Phaser.Input.Keyboard.KeyCodes.A, 'down': Phaser.Input.Keyboard.KeyCodes.S, 'right': Phaser.Input.Keyboard.KeyCodes.D, 'jump': Phaser.Input.Keyboard.KeyCodes.W, 'attack_light': Phaser.Input.Keyboard.KeyCodes.J, 'attack_heavy': Phaser.Input.Keyboard.KeyCodes.K, 'special_attack': Phaser.Input.Keyboard.KeyCodes.L, 'ultimate_attack': Phaser.Input.Keyboard.KeyCodes.I, 'dash': Phaser.Input.Keyboard.KeyCodes.SPACE }})`
3. Window assignment: `window.setupControls = setupControls;`

**runCombatLoop() REQUIREMENTS:**
1. Function declaration with defensive null checks: `if (!scene) {{ console.error('Scene is undefined'); return; }}`
2. Check round start: `if (!scene.roundStarted) {{ player.setVelocityX(0); player.play('player_idle', true); return; }}`
3. Player movement: `if (keys.left && keys.left.isDown) {{ player.setVelocityX(-200); player.setFlipX(true); player.play('player_walk', true); }}`
4. Player jump: `if (keys.jump && Phaser.Input.Keyboard.JustDown(keys.jump) && player.body.onFloor()) {{ player.setVelocityY(-350); }}`
5. Player attacks: `if (Phaser.Input.Keyboard.JustDown(keys.attack_light)) {{ player.play('player_punch', true); }}`
6. Clamp opponent to ground: `const groundY = scene.sys.game.config.height - 60; if (opponent.y > groundY) {{ opponent.y = groundY; opponent.setVelocityY(0); }}`
7. AI movement: Check distance between player and opponent, move toward player if distance > 120, attack if close
8. Health system: `scene.events.on('player_hit', (target, damage) => {{ let currentHealth = target.getData('health'); currentHealth -= damage; target.setData('health', currentHealth); }})`
9. Window assignment: `window.runCombatLoop = runCombatLoop;`

**CRITICAL:** Generate COMPLETE code implementing all requirements. Do not use placeholder text or incomplete implementations.

**FINAL INSTRUCTION:** 
Generate the EXACT code structure shown above, replacing placeholder names with actual asset names from the blueprint. Do NOT use placeholder text like "// Add code here" or "// TODO". Every function must contain the complete implementation that will work immediately when the game loads.

**WARNING:** If you generate placeholder code like "function loadAssets(scene) {{ console.log('Loading assets...'); }}", the game will show a black screen and fail. You MUST generate the complete, working code as shown in the structure above.

### "ui_templates"

Based on the ui_ux section of the input JSON, generate:

TailwindCSS + HTML (or optional React JSX) snippets for:
    Main Menu
    Character Select Screen
    In-Game HUD (health bar, energy bar, combo counter)
    Prompt input box (for future dynamic updates)

UI must:
    Be mobile-responsive
    Reflect the described style (e.g., "anime-inspired interface with vibrant colors")
    Be accessible and modern

Output format:
```json
{{
  "start_screen": "<div class='...'>...</div>",
  "hud": "<div class='...'>...</div>"
}}
```

### "dynamic_loading_plan"

Generate a JSON manifest for dynamic loading of all assets at runtime, based on the blueprint:
Each asset should include:
- type: character / background / fx / audio
- name: logical name
- placeholder_url: relative path (e.g., assets/characters/goku_ssj_spritesheet.png)
- dimensions: if known
- load_order: preload / lazy / conditional

**CRITICAL NAMING CONVENTIONS:**
- Characters: `assets/characters/character_name_spritesheet.png`
- Effects: `assets/effects/effect_name_fx.png`
- Backgrounds: `assets/backgrounds/background_name.png`
- UI: `assets/ui/ui_element.png`

**Asset Specifications:**
- Character spritesheets: 512x512 pixels per frame
- Effect spritesheets: 256x256 to 1024x512 pixels per frame
- Backgrounds: 1920x1080 pixels
- UI elements: 256x256 pixels

Output format:
```json
[
  {{
    "type": "character",
    "name": "goku_ssj_spritesheet",
    "placeholder_url": "assets/characters/goku_ssj_spritesheet.png",
    "frame_dimensions": "512x512",
    "load_order": "preload"
  }},
  {{
    "type": "background",
    "name": "battle_arena_desert",
    "placeholder_url": "assets/backgrounds/battle_arena_desert.png",
    "dimensions": "1920x1080",
    "load_order": "preload"
  }}
]
```

## Important Constraints

You are not generating full game code — only well-structured modules, prompts, and templates to speed up developer implementation.
Follow Phaser 3 syntax for all JS.
Prioritize clean, production-quality output.
Assume the frontend uses React with Tailwind.
Do not generate placeholder text like "insert code here". Always complete the requested block as if it will be copy-pasted into production.

CRITICAL: 
- Return ONLY valid JSON with proper escaping
- Use double quotes for all strings
- Escape all backslashes as double backslashes
- Do not use unescaped special characters
- Test that your JSON is valid before responding

## FINAL OUTPUT FORMAT
{{
  "asset_prompts": {{ ... }},
  "phaser_modules": {{ ... }},
  "ui_templates": {{ ... }},
  "dynamic_loading_plan": [ ... ]
}}
"""


    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    body = {
        "contents": [
            {
                "parts": [
                    {"text": system_prompt}
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(url, json=body, headers=headers)
        print(f"[Gemini] Status code: {res.status_code}")
        # print(f"[Gemini] Response text: {res.text[:1000]}")  # Print up to 1000 chars
        res.raise_for_status()
        data = res.json()
        
        # Get the raw text response from Gemini
        raw_text = data['candidates'][0]['content']['parts'][0]['text']
        # print(f"[Gemini] Raw text response: {raw_text[:500]}...")
        
        # Extract JSON from markdown code blocks
        json_text = extract_json_from_markdown(raw_text)
        print(f"[Gemini] Extracted JSON length: {len(json_text)} characters")
        
        # Parse the extracted JSON
        try:
            parsed_json = safe_json_loads(json_text)
            print(f"[Gemini] Successfully parsed production plan JSON with keys: {list(parsed_json.keys())}")
            return parsed_json
        except Exception as e:
            print(f"[Gemini] Error parsing production plan JSON: {e}")
            print(f"[Gemini] First 1000 characters of extracted text: {json_text[:1000]}")
            raise ValueError(f"Failed to parse production plan JSON. Error: {str(e)}") from e
            
    except requests.exceptions.RequestException as e:
        print(f"[Gemini] RequestException: {e}")
        error_message = f"An error occurred while making the API request: {e}"
        if hasattr(e, 'response') and e.response is not None:
            error_message += f". Response text: {e.response.text}"
        raise ValueError(error_message) from e



def generate_image(prompt: str, output_path: str):
    contents = prompt


    response = client.models.generate_content(
        model="gemini-2.0-flash-preview-image-generation",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE']
        )
    )

    found_image = False
    for part in response.candidates[0].content.parts:
        # Log what we got for debugging
        print("Gemini part..")
        if getattr(part, "inline_data", None) is not None:
            mime_type = getattr(part.inline_data, "mime_type", "")
            if mime_type.startswith("image/") and part.inline_data.data:
                try:
                    img_bytes = part.inline_data.data
                    image = Image.open(BytesIO(img_bytes))
                    image.save(output_path)
                    print(f"Saved image to {output_path}")
                    found_image = True
                except Exception as e:
                    print(f"Failed to decode or save image: {e}")
            else:
                print(f"inline_data present but not an image (mime_type={mime_type})")
        elif getattr(part, "text", None) is not None:
            print("Gemini text part:", part.text)

    if not found_image:
        raise ValueError("No valid image data returned by Gemini for this prompt.")

def generate_asset_image(description: str, output_path: str, width: int, height: int, asset_type: str):
    """
    Generate an image using Gemini for a specific asset type (background, character, etc.)
    and save it to output_path with the given width and height.
    """
    prompt = f"""
You are a professional 2D game artist specializing in stylized asset creation for platformers, RPGs, and adventure games. Your task is to generate a visually appealing, production-quality image asset based on the following details:

- **Asset Type**: {asset_type}
- **Asset Description**: {description}
- **Required Dimensions**: {width}x{height} pixels (exact)
- **Style**: Consistent with modern 2D game aesthetics (e.g., clean lines, balanced color palette, stylized shading). The asset should match the visual coherence of a high-quality 2D game world.
- **Purpose**: This asset will be used directly in a playable game, so it must blend seamlessly with other game assets of the same genre.
- **Technical Constraints**:
    - Ensure the output image size is exactly {width}x{height} pixels.
    - Keep edges clean and avoid unnecessary white or transparent padding.
    - Center or align the asset appropriately depending on its type (e.g., characters centered, backgrounds fill the frame).
    - No watermarks, text, UI elements, or signature overlays.

### Instructions:
Generate only one image without any explanation or text in the output. The result should be ready for use as an in-game asset.

"""

    response = client.models.generate_content(
        model="gemini-2.0-flash-preview-image-generation",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE']
        )
    )
    found_image = False
    for part in response.candidates[0].content.parts:
        if getattr(part, "inline_data", None) is not None:
            mime_type = getattr(part.inline_data, "mime_type", "")
            if mime_type.startswith("image/") and part.inline_data.data:
                try:
                    img_bytes = part.inline_data.data
                    image = Image.open(BytesIO(img_bytes))
                    image = image.resize((width, height))
                    image.save(output_path)
                    found_image = True
                except Exception as e:
                    print(f"Failed to decode or save image: {e}")
            else:
                print(f"inline_data present but not an image (mime_type={mime_type})")
        elif getattr(part, "text", None) is not None:
            print("Gemini text part:", part.text)
    if not found_image:
        raise ValueError("No valid image data returned by Gemini for this prompt.")

# Example improved prompt for character sprite sheet generation:
# "Create a 2D character sprite sheet for a fighting game. The character should be in a side view, with 12 columns and 5 rows (total 60 frames), each frame exactly 85x117 pixels. The character is [Character Name] (Dragon Ball Z, Super Saiyan), in anime style, with vibrant colors and high detail. Each row should represent a different action (idle, walk, punch, kick, special attack). Each frame should be evenly spaced, with a fully transparent background and no overlap between frames. The character should be centered in each frame, with consistent lighting and proportions. No background, only the character. The sprite sheet should be ready for use in a Phaser.js game."