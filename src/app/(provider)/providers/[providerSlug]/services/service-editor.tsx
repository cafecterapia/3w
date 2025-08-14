'use client';

import { useState } from 'react';
import { CreateServiceData } from '@/types/provider';

interface ServiceEditorProps {
  onSubmit: (data: CreateServiceData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateServiceData>;
}

export default function ServiceEditor({
  onSubmit,
  onCancel,
  initialData,
}: ServiceEditorProps) {
  const [formData, setFormData] = useState<CreateServiceData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Service Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value || null,
              }))
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Price (in BRL)
          </label>
          <input
            type="number"
            id="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-primary text-secondary rounded-lg hover:bg-accent transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </form>
    </div>
  );
}
