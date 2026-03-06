'use client';

import { Property } from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Download, Edit, Loader2, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  processing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const statusLabels = {
  draft: 'Draft',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const thumbnailUrl = property.thumbnailUrl || property.photos?.[0]?.url || null;
  const createdDate = new Date(property.createdAt.seconds * 1000).toLocaleDateString();
  const title = property.title || `${property.propertyType || 'Property'} - ${property.bedrooms || '?'} bed`;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property video?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/property/${property.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete property');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

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
        
        {property.status === 'ready' && property.videoUrl && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <a href={property.videoUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full bg-white text-gray-800 hover:bg-gray-100">
                <Play className="w-6 h-6" />
              </Button>
            </a>
          </div>
        )}
        
        {property.status === 'processing' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
            {statusLabels[property.status]}
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
        {property.status === 'draft' && (
          <Link href={`/dashboard/edit/${property.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        )}
        
        {property.status === 'ready' && property.videoUrl && (
          <a href={property.videoUrl} download className="flex-1">
            <Button variant="outline" className="w-full gap-1">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </a>
        )}
        
        {property.status === 'failed' && (
          <Link href={`/dashboard/edit/${property.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-1 text-red-600">
              <Edit className="w-4 h-4" />
              Retry
            </Button>
          </Link>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-400 hover:text-red-600"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
