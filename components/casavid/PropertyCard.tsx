'use client';

import { useState, useEffect, useCallback } from 'react';
import { Property } from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Download, Edit, Loader2, Play } from "lucide-react";
import Link from "next/link";

interface PropertyCardProps {
  property: Property;
}

interface PropertyStatus {
  status: 'draft' | 'processing' | 'ready' | 'failed';
  videoUrl: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  processing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const statusLabels = {
  draft: 'Draft',
  processing: 'Processing...',
  ready: 'Ready',
  failed: 'Failed',
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const [currentStatus, setCurrentStatus] = useState<PropertyStatus>({
    status: property.status,
    videoUrl: property.videoUrl || null,
    thumbnailUrl: property.thumbnailUrl || null,
    errorMessage: null,
  });

  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/property/${property.id}/status`);
      if (response.ok) {
        const data: PropertyStatus = await response.json();
        setCurrentStatus(data);
        return data.status;
      }
    } catch (error) {
      console.error('Failed to poll status:', error);
    }
    return currentStatus.status;
  }, [property.id, currentStatus.status]);

  useEffect(() => {
    if (currentStatus.status !== 'processing') return;

    // Poll immediately on mount to get fresh status (handles stale cache on navigation)
    pollStatus();

    const interval = setInterval(async () => {
      const newStatus = await pollStatus();
      if (newStatus !== 'processing') {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentStatus.status, pollStatus]);

  const thumbnailUrl = currentStatus.thumbnailUrl || property.photos?.[0]?.url || null;
  const createdDate = new Date(property.createdAt.seconds * 1000).toLocaleDateString();
  const title = property.title || `${property.propertyType || 'Property'} - ${property.bedrooms || '?'} bed`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gray-100">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🏠
          </div>
        )}
        
        {currentStatus.status === 'ready' && currentStatus.videoUrl && (
          <Link href={`/dashboard/view/${property.id}`} className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button size="lg" className="rounded-full bg-white text-gray-800 hover:bg-gray-100">
              <Play className="w-6 h-6" />
            </Button>
          </Link>
        )}
        
        {currentStatus.status === 'processing' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
            <span className="text-white text-xs">Generating...</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus.status]}`}>
            {statusLabels[currentStatus.status]}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-500">{createdDate}</p>
        <div className="flex gap-2 text-xs text-gray-500 mt-1">
          <span>{property.bedrooms} bed</span>
          <span>•</span>
          <span>{property.bathrooms} bath</span>
          <span>•</span>
          <span>{property.videoLength}s video</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        {currentStatus.status === 'draft' && (
          <Link href={`/dashboard/edit/${property.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        )}
        
        {currentStatus.status === 'ready' && currentStatus.videoUrl && (
          <>
            <Link href={`/dashboard/view/${property.id}`} className="flex-1">
              <Button className="w-full gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="w-4 h-4" />
                View
              </Button>
            </Link>
            <a href={`/api/property/${property.id}/download`} className="flex-1">
              <Button className="w-full gap-1 bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </a>
          </>
        )}
        
        {currentStatus.status === 'processing' && (
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating video...
            </span>
          </div>
        )}
        
        {currentStatus.status === 'failed' && (
          <Link href={`/dashboard/edit/${property.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-1 text-red-600">
              <Edit className="w-4 h-4" />
              Retry
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
