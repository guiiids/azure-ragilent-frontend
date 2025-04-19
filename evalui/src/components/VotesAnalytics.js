import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VotesAnalytics.css';

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); // last 7 days, inclusive
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

const VotesAnalytics = () => {
  const [votes, setVotes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [expandedVote, setExpandedVote] = useState(null);

  // Date range state for CSV export
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [csvLoading, setCsvLoading] = useState(false);

  // Fetch votes and statistics
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch votes
        const votesParams = {
          offset: (page - 1) * limit,
          limit: limit
        };
        
        if (filter !== 'all') {
          votesParams.vote = filter;
        }
        
        // Use absolute URLs to bypass proxy issues
        const votesResponse = await axios.get('http://localhost:5001/votes', { params: votesParams });
        console.log('Votes response:', votesResponse);
        setVotes(votesResponse.data.votes || []);
        
        // Fetch statistics
        const statsResponse = await axios.get('http://localhost:5001/votes/statistics');
        console.log('Statistics response:', statsResponse);
        setStatistics(statsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filter, page, limit]);

  // CSV export handler
  const handleDownloadCSV = async () => {
    setCsvLoading(true);
    setError(null);
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      };
      // Fetch all votes in date range (no limit)
      const response = await axios.get('http://localhost:5001/votes', { params });
      const allVotes = response.data.votes || [];
      if (allVotes.length === 0) {
        setError('No votes found in the selected date range.');
        setCsvLoading(false);
        return;
      }
      // Convert to CSV
      const headers = [
        'id',
        'user_query',
        'bot_response',
        'evaluation_json',
        'vote',
        'comment',
        'timestamp'
      ];
      const csvRows = [
        headers.join(','),
        ...allVotes.map(vote =>
          headers.map(h => {
            let val = vote[h];
            if (h === 'evaluation_json') {
              // Ensure JSON is stringified and escaped
              try {
                val = typeof val === 'string' ? val : JSON.stringify(val);
              } catch {
                val = '';
              }
            }
            // Escape double quotes and wrap in quotes if needed
            if (typeof val === 'string') {
              val = val.replace(/"/g, '""');
              if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                val = `"${val}"`;
              }
            }
            return val ?? '';
          }).join(',')
        )
      ];
      const csvContent = csvRows.join('\n');
      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `votes_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Toggle expanded vote
  const toggleExpandVote = (id) => {
    if (expandedVote === id) {
      setExpandedVote(null);
    } else {
      setExpandedVote(id);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="votes-analytics">
      <h2>Feedback Analytics Dashboard</h2>

      {/* CSV Export Controls */}
      <div className="csv-export-controls" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label>
          Start Date:&nbsp;
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:&nbsp;
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={getDefaultDateRange().end}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>
        <button
          onClick={handleDownloadCSV}
          disabled={csvLoading}
          style={{ padding: '6px 16px', fontWeight: 600 }}
        >
          {csvLoading ? 'Exporting...' : 'Download CSV'}
        </button>
      </div>

      {loading && <div className="loading">Loading data...</div>}

      {error && <div className="error">{error}</div>}

  {!loading && !error && (
    <React.Fragment>
      {/* Statistics Section */}
      {statistics && (
            <div className="statistics-section">
              <h3>Summary Statistics</h3>
              <div className="statistics-cards">
                <div className="stat-card">
                  <h4>Total Votes</h4>
                  <div className="stat-value">{statistics.total_votes}</div>
                </div>
                
                <div className="stat-card">
                  <h4>Positive Feedback</h4>
                  <div className="stat-value">{statistics.yes_votes}</div>
                  <div className="stat-percentage">
                    {statistics.yes_percentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="stat-card">
                  <h4>Negative Feedback</h4>
                  <div className="stat-value">{statistics.no_votes}</div>
                  <div className="stat-percentage">
                    {statistics.no_percentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="stat-card">
                  <h4>With Comments</h4>
                  <div className="stat-value">{statistics.votes_with_comments}</div>
                  <div className="stat-percentage">
                    {statistics.total_votes > 0 
                      ? ((statistics.votes_with_comments / statistics.total_votes) * 100).toFixed(1) 
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Votes Table Section */}
          <div className="votes-table-section">
            <div className="table-controls">
              <div className="filter-control">
                <label htmlFor="vote-filter">Filter by:</label>
                <select 
                  id="vote-filter" 
                  value={filter} 
                  onChange={handleFilterChange}
                >
                  <option value="all">All Votes</option>
                  <option value="yes">Positive Only</option>
                  <option value="no">Negative Only</option>
                </select>
              </div>
              
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(page - 1)} 
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>Page {page}</span>
                <button 
                  onClick={() => handlePageChange(page + 1)} 
                  disabled={votes.length < limit}
                >
                  Next
                </button>
              </div>
            </div>
            
            {votes.length === 0 ? (
              <div className="no-votes">No votes found matching the current filter.</div>
            ) : (
              <table className="votes-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vote</th>
                    <th>Query</th>
                    <th>Comment</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map(vote => (
                    <React.Fragment key={vote.id}>
                      <tr className={`vote-row ${vote.vote === 'yes' ? 'positive' : 'negative'}`}>
                        <td>{vote.id}</td>
                        <td>
                          <span className={`vote-badge ${vote.vote}`}>
                            {vote.vote === 'yes' ? 'Positive' : 'Negative'}
                          </span>
                        </td>
                        <td>{truncateText(vote.user_query)}</td>
                        <td>{vote.comment ? truncateText(vote.comment) : '-'}</td>
                        <td>{formatDate(vote.timestamp)}</td>
                        <td>
                          <button 
                            className="expand-button"
                            onClick={() => toggleExpandVote(vote.id)}
                          >
                            {expandedVote === vote.id ? 'Hide Details' : 'Show Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedVote === vote.id && (
                        <tr className="expanded-row">
                          <td colSpan="6">
                            <div className="expanded-content">
                              <div className="expanded-section">
                                <h4>User Query</h4>
                                <p>{vote.user_query}</p>
                              </div>
                              
                              <div className="expanded-section">
                                <h4>Bot Response</h4>
                                <p>{vote.bot_response}</p>
                              </div>
                              
                              {vote.comment && (
                                <div className="expanded-section">
                                  <h4>User Comment</h4>
                                  <p>{vote.comment}</p>
                                </div>
                              )}
                              
                              <div className="expanded-section">
                                <h4>Evaluation</h4>
                                <pre>{vote.evaluation_json}</pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default VotesAnalytics;
