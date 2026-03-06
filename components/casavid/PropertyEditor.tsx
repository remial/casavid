'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/app/dashboard/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, GripVertical, Play, Sparkles, Save } from 'lucide-react';

interface PropertyEditorProps {
  property: Property;
  userId: string;
}

interface PhotoItem {
  url: string;
  order: number;
  caption: string;
  duration: number;
}

export default function PropertyEditor({ property, userId }: PropertyEditorProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>(
    property.photos?.map((p, i) => ({
      url: p.url,
      order: p.order ?? i,
      caption: p.caption || '',
      duration: p.duration || 5,
    })) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    
    setPhotos(newPhotos.map((p, i) => ({ ...p, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const updateCaption = (index: number, caption: string) => {
    setPhotos(prev => prev.map((p, i) => 
      i === index ? { ...p, caption } : p
    ));
  };

  const updateDuration = (index: number, duration: number) => {
    setPhotos(prev => prev.map((p, i) => 
      i === index ? { ...p, duration: Math.max(2, Math.min(15, duration)) } : p
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/property/${property.id}/save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos }),
      });

      if (!response.ok) throw new Error('Failed to save');
      
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await handleSave();

      const response = await fetch(`/api/property/${property.id}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start generation');
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Generate error:', error);
      alert(error.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalDuration = photos.reduce((sum, p) => sum + p.duration, 0);

  if (property.status === 'processing') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Video Processing</h2>
          <p className="text-gray-600 mb-4">
            Your property video is being generated. This usually takes 2-5 minutes.
          </p>
          <p className="text-sm text-gray-500">
            You can leave this page. We'll email you when your video is ready.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (property.status === 'ready' && property.videoUrl) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Video Ready!</h2>
            <p className="text-gray-600">Your property walkthrough video is complete.</p>
          </div>
          
          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-6">
            <video 
              src={property.videoUrl} 
              controls 
              className="w-full h-full"
            />
          </div>
          
          <div className="flex justify-center gap-4">
            <a href={property.videoUrl} download>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Download Video
              </Button>
            </a>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Photo Order & Captions</span>
            <span className="text-sm font-normal text-gray-500">
              Drag to reorder • Total: {totalDuration}s
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Arrange photos in the order you want them to appear in the video. Add captions for each room.
          </p>
          
          <div className="space-y-3">
            {photos.map((photo, index) => (
              <div
                key={photo.url}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-3 bg-white border rounded-lg cursor-move transition-all ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={photo.url} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">Caption (optional)</Label>
                    <Input
                      value={photo.caption}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      placeholder="e.g., Spacious living room with natural light"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-24">
                  <Label className="text-xs text-gray-500">Duration (s)</Label>
                  <Input
                    type="number"
                    min={2}
                    max={15}
                    value={photo.duration}
                    onChange={(e) => updateDuration(index, parseInt(e.target.value) || 5)}
                    className="text-sm text-center"
                  />
                </div>
                
                <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-400">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Property Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium capitalize">{property.propertyType}</span>
            </div>
            <div>
              <span className="text-gray-500">Bedrooms:</span>
              <span className="ml-2 font-medium">{property.bedrooms}</span>
            </div>
            <div>
              <span className="text-gray-500">Bathrooms:</span>
              <span className="ml-2 font-medium">{property.bathrooms}</span>
            </div>
            <div>
              <span className="text-gray-500">Voice:</span>
              <span className="ml-2 font-medium capitalize">{property.voiceStyle?.replace('-', ' ')}</span>
            </div>
          </div>
          {property.highlights && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Key Features:</span>
              <p className="mt-1 text-sm">{property.highlights}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Draft
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || photos.length === 0}
            className="bg-blue-600 hover:bg-blue-700 gap-2 px-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Property Video
              </>
            )}
          </Button>
          <span className="text-sm text-gray-500 font-medium">Costs 1 credit</span>
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-500">
        Videos usually take 2-5 minutes to generate
      </p>
    </div>
  );
}
