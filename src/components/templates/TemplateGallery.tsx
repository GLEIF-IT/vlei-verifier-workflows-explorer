import React, { useState, useMemo } from 'react';
import { TemplateService } from '../../services/templateService';
import { ExportedTemplate } from '../../types/template';
import TemplateCard from './TemplateCard';
import './TemplateGallery.css';

interface TemplateGalleryProps {
  onLoadTemplate: (template: ExportedTemplate) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onLoadTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all templates
  const allTemplates = TemplateService.getAllTemplates();

  // Get unique tags from all templates
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allTemplates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allTemplates]);

  // Filter templates based on search query and selected tags
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = TemplateService.searchTemplates(searchQuery);
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.some(tag => template.tags.includes(tag))
      );
    }

    return filtered;
  }, [allTemplates, searchQuery, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <div className="template-gallery">
      <div className="gallery-header">
        <h2>Workflow Templates</h2>
        <p>Browse and load pre-built workflow templates</p>
      </div>

      {/* Search and Filter Section */}
      <div className="gallery-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <div className="tags-filter">
            <span className="filter-label">Filter by tags:</span>
            <div className="tags-list">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || selectedTags.length > 0) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>
          Showing {filteredTemplates.length} of {allTemplates.length} templates
        </span>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onLoad={onLoadTemplate}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No templates found matching your criteria.</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery; 