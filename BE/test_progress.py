#!/usr/bin/env python3
"""
Test script to verify progress tracking system
"""

import requests
import time
import json

def test_progress_system():
    """Test the progress tracking system"""
    
    print("🧪 Testing Progress Tracking System")
    print("=" * 50)
    
    # Test 1: Check if progress endpoint works
    print("1. Testing progress endpoint...")
    response = requests.get("http://localhost:8000/progress/test123")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Progress endpoint working: {data}")
    else:
        print(f"   ❌ Progress endpoint failed: {response.status_code}")
        return
    
    # Test 2: Simulate progress updates
    print("\n2. Simulating progress updates...")
    
    # Create a test request ID
    test_request_id = f"test_{int(time.time() * 1000)}"
    
    # Simulate different progress states
    progress_states = [
        ("initializing", "running", "Starting game generation...", 0),
        ("blueprint", "running", "Generating game blueprint...", 10),
        ("blueprint", "completed", "Game blueprint generated successfully!", 20),
        ("production_plan", "running", "Generating production plan...", 35),
        ("production_plan", "completed", "Production plan generated successfully!", 50),
        ("assets", "running", "Generating game assets...", 65),
        ("assets", "completed", "Game assets generated successfully!", 75),
        ("phaser_files", "running", "Generating Phaser game files...", 80),
        ("phaser_files", "completed", "Phaser game files generated successfully!", 90),
        ("complete", "completed", "Game generation completed successfully! 🎮", 100)
    ]
    
    for step, status, message, progress in progress_states:
        print(f"   📊 {step}: {message} ({progress}%)")
        
        # In a real scenario, this would be called by the backend
        # For testing, we'll simulate it by directly setting the progress data
        from main import progress_data
        progress_data[test_request_id] = {
            "step": step,
            "status": status,
            "message": message,
            "progress_percent": progress,
            "timestamp": time.time()
        }
        
        # Check if the progress is accessible
        response = requests.get(f"http://localhost:8000/progress/{test_request_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"      ✅ Progress updated: {data['message']}")
        else:
            print(f"      ❌ Failed to get progress: {response.status_code}")
        
        time.sleep(0.5)  # Small delay to simulate real-time updates
    
    print("\n3. Testing completion...")
    response = requests.get(f"http://localhost:8000/progress/{test_request_id}")
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'completed' and data['step'] == 'complete':
            print("   ✅ Progress tracking system working correctly!")
        else:
            print(f"   ❌ Unexpected final state: {data}")
    else:
        print(f"   ❌ Failed to get final progress: {response.status_code}")
    
    print("\n🎉 Progress tracking system test completed!")

if __name__ == "__main__":
    test_progress_system() 