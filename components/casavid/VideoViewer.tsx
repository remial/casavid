'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface VideoViewerProps {
  videoUrl: string;
  title: string;
  propertyId: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  videoLength: number;
  highlights?: string;
  thumbnailUrl?: string;
}

export default function VideoViewer({
  videoUrl,
  title,
  propertyId,
  bedrooms,
  bathrooms,
  propertyType,
  videoLength,
  highlights,
  thumbnailUrl,
}: VideoViewerProps) {
  
  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          
          <Button 
            size="sm" 
            className="gap-1 bg-green-600 text-white hover:bg-green-700"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Video Player */}
        <div className="bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
          <video 
            src={videoUrl} 
            controls 
            autoPlay
            className="max-w-full max-h-[70vh]"
            poster={thumbnailUrl}
          />
        </div>

        {/* Property Info */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{bedrooms} bedrooms</span>
            <span>•</span>
            <span>{bathrooms} bathrooms</span>
            <span>•</span>
            <span className="capitalize">{propertyType}</span>
            <span>•</span>
            <span>{videoLength}s video</span>
          </div>

          {highlights && (
            <p className="mt-4 text-gray-500 text-sm">{highlights}</p>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
            <Button 
              className="flex-1  text-white sm:flex-none gap-2 bg-green-600 hover:bg-green-700"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download Video
            </Button>
            
            <Link href={`/dashboard/edit/${propertyId}`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                Edit & Regenerate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
