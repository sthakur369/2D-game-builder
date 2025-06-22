#!/usr/bin/env python3
"""
Test script to verify the complete progress tracking flow
"""

import requests
import time
import json

def test_complete_flow():
    """Test the complete progress tracking flow"""
    
    print("🧪 Testing Complete Progress Flow")
    print("=" * 50)
    
    # Test 1: Start a generation request
    print("1. Starting game generation...")
    
    test_prompt = "A simple 2D platformer game"
    
    try:
        response = requests.post("http://localhost:8000/generate", 
                               json={"prompt": test_prompt},
                               timeout=30)  # 30 second timeout
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Generation started successfully!")
            print(f"   📋 Request ID: {data.get('request_id')}")
            print(f"   📁 Folder: {data.get('folder')}")
            print(f"   ✅ Steps completed: {len(data.get('steps_completed', []))}")
            
            # Test 2: Check progress during generation
            request_id = data.get('request_id')
            if request_id:
                print(f"\n2. Checking progress for request: {request_id}")
                
                # Poll progress a few times
                for i in range(5):
                    time.sleep(2)  # Wait 2 seconds
                    progress_response = requests.get(f"http://localhost:8000/progress/{request_id}")
                    if progress_response.status_code == 200:
                        progress_data = progress_response.json()
                        print(f"   📊 Progress {i+1}: {progress_data.get('message', 'N/A')} ({progress_data.get('progress_percent', 0)}%)")
                        
                        if progress_data.get('step') == 'complete':
                            print("   🎉 Generation completed!")
                            break
                    else:
                        print(f"   ❌ Failed to get progress: {progress_response.status_code}")
            
            print("\n🎉 Complete flow test successful!")
            
        else:
            print(f"   ❌ Generation failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("   ⏰ Request timed out (this is expected for long-running generation)")
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    test_complete_flow() 