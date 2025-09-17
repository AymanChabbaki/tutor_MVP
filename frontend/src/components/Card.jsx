import React from 'react';

const Card = ({ 
  children, 
  className = '',
  onClick = null,
  hover = false,
  padding = true,
  shadow = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  const paddingClass = padding ? 'p-6' : '';
  const shadowClass = shadow ? 'shadow-sm' : '';
  const hoverClass = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `${baseClasses} ${paddingClass} ${shadowClass} ${hoverClass} ${clickableClass} ${className}`;

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card components for specific use cases
export const SessionCard = ({ session, onDelete, onAddToCollection, className = '' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`${className}`} hover>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {session.sessionType === 'summary' && 'Summary Session'}
            {session.sessionType === 'explanation' && 'Explanation Session'}
            {session.sessionType === 'exercises' && 'Exercises Session'}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(session.createdAt)}</p>
        </div>
        <div className="flex space-x-2">
          {onAddToCollection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCollection(session);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
              title="Add to Collection"
            >
              Add to Collection
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
              title="Delete Session"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Input:</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{session.inputText}</p>
        </div>
        
        {session.outputSummary && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Summary:</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{session.outputSummary}</p>
          </div>
        )}
        
        {session.outputExplanation && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Explanation:</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{session.outputExplanation}</p>
          </div>
        )}
        
        {session.outputExercises && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Exercises:</h4>
            <p className="text-sm text-gray-600">{session.outputExercises.length} exercises generated</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export const CollectionCard = ({ collection, onEdit, onDelete, onView, className = '' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`${className}`} hover onClick={() => onView && onView(collection)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{collection.name}</h3>
          <p className="text-sm text-gray-500">Created {formatDate(collection.createdAt)}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(collection);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
              title="Edit Collection"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(collection.id);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
              title="Delete Collection"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      {collection.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
      )}
      
      <div className="flex items-center text-xs text-gray-500">
        <span>{collection.sessions?.length || 0} sessions</span>
      </div>
    </Card>
  );
};

export default Card;