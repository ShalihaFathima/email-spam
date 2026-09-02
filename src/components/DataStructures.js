import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import './DataStructures.css';

const DataStructures = () => {
  const [activeTab, setActiveTab] = useState('bloom');
  const [bloomData, setBloomData] = useState([]);
  const [trieData, setTrieData] = useState([]);
  const [hashData, setHashData] = useState([]);

  useEffect(() => {
    initializeVisualizations();
  }, []);

  const initializeVisualizations = () => {
    // Bloom Filter: Simulate 1024-bit array visualization
    const bloomArray = Array(32).fill(0).map((_, i) => ({
      bucket: `Bucket ${i}`,
      bits: Math.floor(Math.random() * 32),
      capacity: 32
    }));
    setBloomData(bloomArray);

    // Trie: Sample spam keywords organized by length
    const trieStructure = [
      { word: 'click', length: 5, frequency: 12 },
      { word: 'prize', length: 5, frequency: 10 },
      { word: 'free', length: 4, frequency: 18 },
      { word: 'winner', length: 6, frequency: 8 },
      { word: 'lottery', length: 7, frequency: 7 },
      { word: 'money', length: 5, frequency: 14 },
      { word: 'urgent', length: 6, frequency: 9 },
      { word: 'confirm', length: 7, frequency: 6 }
    ];
    setTrieData(trieStructure);

    // Hash Table: Distribution of spam keywords across hash buckets
    const hashTable = Array(8).fill(0).map((_, i) => ({
      bucket: i,
      keywords: Math.floor(Math.random() * 15) + 5,
      collisions: Math.floor(Math.random() * 3)
    }));
    setHashData(hashTable);
  };

  return (
    <div className="data-structures-container">
      <h2>📊 Email Spam Detection Data Structures</h2>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'bloom' ? 'active' : ''}`}
          onClick={() => setActiveTab('bloom')}
        >
          🔍 Bloom Filter
        </button>
        <button 
          className={`tab ${activeTab === 'trie' ? 'active' : ''}`}
          onClick={() => setActiveTab('trie')}
        >
          🌳 Trie Structure
        </button>
        <button 
          className={`tab ${activeTab === 'hash' ? 'active' : ''}`}
          onClick={() => setActiveTab('hash')}
        >
          #️⃣ Hash Table
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'bloom' && (
          <div className="bloom-section">
            <h3>Bloom Filter (1024-bit)</h3>
            <p className="description">
              A probabilistic data structure for testing membership. Uses 4 hash functions 
              to check if email words are in the spam dictionary. Space-efficient with minimal false positives.
            </p>
            <div className="bloom-stats">
              <div className="stat-card">
                <span className="stat-label">Size:</span>
                <span className="stat-value">1024 bits</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Hash Functions:</span>
                <span className="stat-value">4</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">False Positive Rate:</span>
                <span className="stat-value">&lt;1%</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Keywords Stored:</span>
                <span className="stat-value">113</span>
              </div>
            </div>
            
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bloomData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="bucket" tick={{fontSize: 12}} />
                  <YAxis label={{value: 'Active Bits', angle: -90, position: 'insideLeft'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #D4AF37'}}
                    cursor={{fill: 'rgba(212, 175, 55, 0.1)'}}
                  />
                  <Bar dataKey="bits" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'trie' && (
          <div className="trie-section">
            <h3>Trie Structure (Prefix Tree)</h3>
            <p className="description">
              Efficiently stores and retrieves spam keywords. Fast lookup during email scanning.
              Supports prefix matching and auto-complete suggestions.
            </p>
            
            <div className="trie-visualization">
              <div className="trie-tree">
                <div className="tree-node root">
                  <span>ROOT</span>
                  <div className="children">
                    <div className="tree-node">
                      <span>c</span>
                      <div className="children">
                        <div className="tree-node">
                          <span>l</span>
                          <div className="children">
                            <div className="tree-node leaf">click (12)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tree-node">
                      <span>f</span>
                      <div className="children">
                        <div className="tree-node leaf">free (18)</div>
                      </div>
                    </div>
                    <div className="tree-node">
                      <span>p</span>
                      <div className="children">
                        <div className="tree-node leaf">prize (10)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="length" name="Word Length" type="number" />
                  <YAxis dataKey="frequency" name="Frequency" />
                  <Tooltip 
                    cursor={{fill: 'rgba(212, 175, 55, 0.1)'}}
                    contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #D4AF37'}}
                  />
                  <Scatter name="Spam Words" data={trieData} fill="#D4AF37" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'hash' && (
          <div className="hash-section">
            <h3>Hash Table (Collision Handling)</h3>
            <p className="description">
              Distributes spam keywords across 8 hash buckets using collision resolution.
              Enables O(1) average-case lookup performance for spam detection.
            </p>
            
            <div className="hash-stats">
              <div className="stat-card">
                <span className="stat-label">Buckets:</span>
                <span className="stat-value">8</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Load Factor:</span>
                <span className="stat-value">0.85</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Collision Resolution:</span>
                <span className="stat-value">Chaining</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Avg Lookup:</span>
                <span className="stat-value">O(1)</span>
              </div>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hashData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="bucket" />
                  <YAxis yAxisId="left" label={{value: 'Keywords', angle: -90, position: 'insideLeft'}} />
                  <YAxis yAxisId="right" orientation="right" label={{value: 'Collisions', angle: 90, position: 'insideRight'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #D4AF37'}}
                    cursor={{fill: 'rgba(212, 175, 55, 0.1)'}}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="keywords" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="collisions" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="info-box">
        <h4>💡 How These Data Structures Work Together</h4>
        <ul>
          <li><strong>Bloom Filter:</strong> Quickly checks if a word might be spam (probabilistic)</li>
          <li><strong>Trie:</strong> Stores actual spam keywords in memory for fast prefix matching</li>
          <li><strong>Hash Table:</strong> Provides O(1) lookup for spam keyword verification</li>
          <li><strong>Combined:</strong> First check Bloom Filter (fast), then Trie (accurate)</li>
        </ul>
      </div>
    </div>
  );
};

export default DataStructures;
