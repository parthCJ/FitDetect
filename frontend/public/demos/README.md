# Demo Videos Setup

## Instructions

To enable the demo videos on the dashboard, please copy your demo videos to this folder with the following names:

### Required Files:

1. **pushup-demo.mp4** - Push-up exercise detection demo
   - Source: `C:\Users\CJ\Videos\Screen Recordings\SIH\Screen Recording 2025-09-17 175543.mp4`
   - Copy to: `D:\exercise\frontend\public\demos\pushup-demo.mp4`

2. **squat-demo.mp4** - Squat exercise detection demo
   - Source: `C:\Users\CJ\Videos\Screen Recordings\SIH\Screen Recording 2025-09-25 100325.mp4`
   - Copy to: `D:\exercise\frontend\public\demos\squat-demo.mp4`

## How to Copy (Windows PowerShell):

```powershell
# Copy Push-up demo
Copy-Item "C:\Users\CJ\Videos\Screen Recordings\SIH\Screen Recording 2025-09-17 175543.mp4" "D:\exercise\frontend\public\demos\pushup-demo.mp4"

# Copy Squat demo
Copy-Item "C:\Users\CJ\Videos\Screen Recordings\SIH\Screen Recording 2025-09-25 100325.mp4" "D:\exercise\frontend\public\demos\squat-demo.mp4"
```

## Alternative: Manual Copy

1. Navigate to: `C:\Users\CJ\Videos\Screen Recordings\SIH\`
2. Copy the push-up video file
3. Paste it to: `D:\exercise\frontend\public\demos\`
4. Rename it to: `pushup-demo.mp4`
5. Repeat for the squat video, naming it: `squat-demo.mp4`

## Verify Setup

Once copied, you should have:
- `D:\exercise\frontend\public\demos\pushup-demo.mp4`
- `D:\exercise\frontend\public\demos\squat-demo.mp4`

The demo button on the dashboard will now play these videos!
