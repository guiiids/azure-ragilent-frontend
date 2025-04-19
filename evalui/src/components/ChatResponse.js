import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ChatResponse.css';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown if not already used elsewhere

// --- Removed formatResponseWithSourceNames function as logic moves to render ---
// --- Removed unused truncateText helper function ---

const ChatResponse = ({ response, sources }) => {
  const { getThemeClass, getThemeStyle } = useTheme();
  if (!response) return null;

  // Preprocess the response to convert [Source_X] to Markdown links with proper numbers
  const preprocessResponse = (text) => {
    if (!text || !sources || sources.length === 0) return text;
    
    // Replace [Source_X] with [X](#) to make it a valid Markdown link with just the number
    return text.replace(/\[Source_(\d+)\]/g, (match, sourceNum) => {
      // Convert to number
      const num = parseInt(sourceNum, 10);
      
      // Ensure the number is within bounds of available sources
      const displayNum = num <= sources.length ? num : sources.length;
      
      // Return as a Markdown link with just the number
      return `[${displayNum}](#)`;
    });
  };
  
  // Apply preprocessing to the response
  const processedResponse = preprocessResponse(response);

  // Handle source click (no changes needed here for now)
  const handleSourceClick = (source) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.open(); // Ensure document is ready for writing

      let contentHtml = '';
      const content = source.content || ''; // Ensure content is not null/undefined

      // Check if content is a base64 data URI
      if (content.startsWith('data:')) {
        const mimeTypeMatch = content.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : null;

        if (mimeType && mimeType.startsWith('image/')) {
          // Display base64 image
          contentHtml = `<img src="${content}" alt="${source.title}" style="max-width: 100%; height: auto;">`;
        } else if (mimeType === 'application/pdf') {
          // Display base64 PDF using embed or iframe
          contentHtml = `<embed src="${content}" type="application/pdf" width="100%" height="600px" />`;
          // Alternatively, use iframe:
          // contentHtml = `<iframe src="${content}" width="100%" height="600px" style="border: none;"></iframe>`;
        } else {
          // Fallback for other base64 types - show a message or download link
          contentHtml = `<p>Cannot display content directly. Content type: ${mimeType || 'Unknown'}</p><a href="${content}" download="${source.title || 'download'}">Download Content</a>`;
        }
      } else {
        // Display plain text safely using a pre tag
        const pre = newWindow.document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap'; // Ensure wrapping
        pre.textContent = content; // Set text content safely
        contentHtml = pre.outerHTML;
      }

      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${source.title || 'Source Document'}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; margin: 0; }
              h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; }
              .content-container { margin-top: 15px; }
              /* Ensure embed/iframe takes full width */
              embed, iframe { display: block; width: 100%; } 
            </style>
          </head>
          <body>
            <h1>${source.title || 'Source Document'}</h1>
            <div class="content-container">
              ${contentHtml}
            </div>
          </body>
        </html>
      `);
      newWindow.document.close(); // Finalize writing
    } else {
      console.error("Failed to open new window. Pop-up blocker might be active.");
      // Optionally, provide fallback behavior like downloading the content
    }
  };

  // Custom renderer for links within ReactMarkdown
  const renderLink = ({ node, children, href, ...props }) => {
    // Check if the link text content matches the citation pattern e.g., "[1]"
    const linkText = node.children[0]?.value || '';
    const citationMatch = linkText.match(/^\[(\d+)\]$/); // Match text like "[1]", "[2]", etc.

    if (citationMatch && sources && sources.length > 0) {
      // Extract the citation number
      const citationNumber = parseInt(citationMatch[1], 10);
      
      // Calculate the source index (0-based)
      // Ensure it's within bounds of available sources
      const sourceIndex = Math.min(Math.max(citationNumber - 1, 0), sources.length - 1);

      // Ensure the sourceIndex is valid
      if (sourceIndex >= 0 && sourceIndex < sources.length) {
        const source = sources[sourceIndex];
        const hasValidUrl = source.url && source.url !== '#';
        
        // Define explicit styles to match the test_citation.html example
        const explicitStyles = {
          color: '#2185D0',
          textDecoration: 'none',
          fontWeight: 'bold'
        };
        
        const linkProps = {
          className: getThemeClass('citationLink'),
          style: { ...getThemeStyle('citationLink'), ...explicitStyles },
          key: `citation-${sourceIndex}`, // Add key for list rendering
        };

        // Display as [1], [2], etc. based on the citation number
        const displayText = `[${citationNumber}]`;

        if (hasValidUrl) {
          // Render as a normal link if URL is valid
          return (
            <a
              href={source.url}
              {...linkProps}
              {...props} // Pass other props like target, rel
              target="_blank" // Ensure citations open in new tab
              rel="noopener noreferrer"
            >
              {displayText}
            </a>
          );
        } else {
          // Render as a button if no valid URL
          return (
            <button
              type="button"
              onClick={() => handleSourceClick(source)}
              {...linkProps}
              style={{ ...linkProps.style, background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'inline', verticalAlign: 'baseline', font: 'inherit' }}
            >
              {displayText}
            </button>
          );
        }
      }
    }

    // If it's not a citation link matching our pattern, render a standard link
    // Ensure standard links also open in a new tab
    return (
      <a href={href} {...props} target="_blank" rel="noopener noreferrer" className={getThemeClass('standardLink')} style={getThemeStyle('standardLink')}>
        {children}
      </a>
    );
  };

  // --- Removed renderResponseWithCitations function ---

  return (
    <div className="chat-response">
      <div className="response-content">
        <h3>Response</h3>
        {/* Use ReactMarkdown with custom link renderer */}
        <div className="response-text">
          <ReactMarkdown components={{ a: renderLink }}>
            {processedResponse || ''}
          </ReactMarkdown>
        </div>
      </div>

      {sources && sources.length > 0 && (
        <div className="sources-section">
          <h4>Sources</h4>
          <ol className="sources-list">
            {sources.map((source, index) => {
              const hasValidUrl = source.url && source.url !== '#';
              const linkProps = {
                className: "source-link",
                style: {},
              };
              return (
                <li key={index} className="source-item">
                  {hasValidUrl ? (
                    <a
                      href={source.url}
                      {...linkProps}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={source.title}
                    >
                      <span className="source-title">
                        {source.title}
                      </span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSourceClick(source)}
                      className="source-link"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                      title={source.title}
                    >
                      <span className="source-title">
                        {source.title}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ChatResponse;
