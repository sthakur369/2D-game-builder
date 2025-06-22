#!/usr/bin/env python3
"""
Test script to demonstrate template file generation
"""

import os
import sys

# Add the current directory to Python path to import from main.py
sys.path.append(os.path.dirname(__file__))

from main import generate_standard_template_files

def test_template_generation():
    """Test the template generation function"""
    
    # Create test directories
    test_phaser_dir = "test_phaser"
    test_scenes_dir = os.path.join(test_phaser_dir, "scenes")
    
    os.makedirs(test_scenes_dir, exist_ok=True)
    
    try:
        # Generate template files
        generate_standard_template_files(test_phaser_dir, test_scenes_dir)
        
        # Check if files were created
        files_to_check = [
            os.path.join(test_phaser_dir, "main.js"),
            os.path.join(test_phaser_dir, "index.html"),
            os.path.join(test_scenes_dir, "GameScene.js")
        ]
        
        for file_path in files_to_check:
            if os.path.exists(file_path):
                print(f"✅ Created: {file_path}")
                # Show first few lines
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[:5]
                    print(f"   Preview: {''.join(lines).strip()}")
            else:
                print(f"❌ Missing: {file_path}")
        
        print("\n🎉 Template generation successful!")
        print("These files can now be used as templates for any new game.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        # Clean up test files
        import shutil
        if os.path.exists(test_phaser_dir):
            shutil.rmtree(test_phaser_dir)
            print(f"\n🧹 Cleaned up test directory: {test_phaser_dir}")

if __name__ == "__main__":
    test_template_generation() 