// lib/config.ts
// Centralized configuration for the application

/**
 * 🔧 MAINTENANCE MODE
 * Set to true to disable video generation for subscribed users.
 * Users can still view their existing videos.
 * 
 * This affects: /dashboard, /cinema, /extended pages
 */
export const MAINTENANCE_MODE = false;

/**
 * Maintenance message displayed to users
 */
export const MAINTENANCE_MESSAGE = {
  title: "Server Maintenance in Progress",
  description: "We're currently performing maintenance on our video generation servers. Video creation is temporarily disabled. Please check back soon!"
};

/**
 * 🎬 IN-HOUSE CAPTIONING
 * Set to true to use the in-house Whisper-based autocaption endpoint on DigitalOcean.
 * Set to false to use Replicate's autocaption service.
 * 
 * In-house: http://64.23.164.108:3000/autocaption (uses faster-whisper, free)
 * Replicate: fictions-ai/autocaption (~$0.03/video)
 * 
 * Before enabling, ensure:
 * 1. whisper_transcribe.py is deployed to /root/ on the server
 * 2. faster-whisper is installed: pip3 install faster-whisper
 * 3. DOAPIServer_v3.js (v3.6+) is running with /autocaption endpoint
 */
export const USE_INHOUSE_CAPTIONING = true;

/**
 * DigitalOcean FFmpeg API server URL
 */
export const DO_FFMPEG_API_URL = "http://64.23.164.108:3000";

