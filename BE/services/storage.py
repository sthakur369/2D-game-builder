import os, json

def safe_filename(name):
    return "".join(c if c.isalnum() or c in "-_ " else "_" for c in name).strip().replace(" ", "_")

def save_game_blueprint(blueprint, base_dir="games"):
    title = blueprint.get("meta", {}).get("title", "Untitled Game")
    folder_name = safe_filename(title)
    game_folder = os.path.join(base_dir, folder_name)
    os.makedirs(game_folder, exist_ok=True)

    path = os.path.join(game_folder, "blueprint.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(blueprint, f, indent=2)
    
    return game_folder, path

def save_production_plan(folder, plan):
    """Save the production plan as production_plan.json in the given game folder."""
    path = os.path.join(folder, "production_plan.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2)
    return path
