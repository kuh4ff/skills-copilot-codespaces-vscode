// Bug Bounty AI App - Frontend JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const targetInput = document.getElementById('targetInput');
    const targetType = document.getElementById('targetType');
    const scanResults = document.getElementById('scanResults');
    const resultsContent = document.getElementById('resultsContent');
    const refreshReportsBtn = document.getElementById('refreshReportsBtn');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const reportsContainer = document.getElementById('reportsContainer');
    const statsModal = document.getElementById('statsModal');
    const closeModal = document.querySelector('.close');

    // Example code snippets for testing
    const exampleVulnerableCode = `
// Example vulnerable code
const query = "SELECT * FROM users WHERE id = '" + userId + "'";
document.getElementById('output').innerHTML = userInput;
const password = "hardcoded123";
eval(userInput);
`;

    // Scan button handler
    scanBtn.addEventListener('click', async () => {
        const target = targetInput.value.trim();
        const type = targetType.value;

        if (!target) {
            alert('Please enter a URL or code to scan');
            return;
        }

        scanBtn.disabled = true;
        scanBtn.textContent = '🔄 Scanning...';

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ target, type })
            });

            const result = await response.json();

            if (response.ok) {
                displayResults(result);
                loadReports(); // Refresh reports list
            } else {
                alert(`Scan failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Scan error:', error);
            alert('Failed to perform scan. Please try again.');
        } finally {
            scanBtn.disabled = false;
            scanBtn.textContent = '🔍 Scan for Vulnerabilities';
        }
    });

    // Display scan results
    function displayResults(result) {
        scanResults.style.display = 'block';
        
        let html = `
            <div class="scan-summary">
                <h4>Scan Summary</h4>
                <p><strong>Target:</strong> ${escapeHtml(result.target.substring(0, 100))}${result.target.length > 100 ? '...' : ''}</p>
                <p><strong>Type:</strong> ${result.type}</p>
                <p><strong>Vulnerabilities Found:</strong> ${result.totalVulnerabilities}</p>
                <p><strong>Overall Severity:</strong> <span class="severity-badge severity-${result.severity}">${result.severity}</span></p>
                <p><strong>Scanned At:</strong> ${new Date(result.scannedAt).toLocaleString()}</p>
            </div>
        `;

        if (result.vulnerabilities.length > 0) {
            html += '<h4>🚨 Detected Vulnerabilities</h4>';
            result.vulnerabilities.forEach((vuln, index) => {
                html += `
                    <div class="vulnerability-card ${vuln.severity}">
                        <span class="severity-badge severity-${vuln.severity}">${vuln.severity}</span>
                        <h5>${index + 1}. ${vuln.type.toUpperCase().replace(/_/g, ' ')}</h5>
                        <p><strong>Description:</strong> ${vuln.description}</p>
                        <p><strong>Recommendation:</strong> ${vuln.recommendation}</p>
                        ${vuln.matches ? `<p><strong>Found:</strong> ${vuln.matches.length} occurrence(s)</p>` : ''}
                    </div>
                `;
            });
        } else {
            html += '<div class="vulnerability-card LOW"><p>✅ No vulnerabilities detected!</p></div>';
        }

        // AI Analysis
        if (result.aiAnalysis) {
            html += `
                <div class="ai-analysis">
                    <h4>🤖 AI Analysis</h4>
                    <p><strong>Risk Score:</strong> ${result.aiAnalysis.riskScore}/100</p>
                    <h5>Insights:</h5>
                    <ul>
                        ${result.aiAnalysis.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                    ${result.aiAnalysis.recommendations.length > 0 ? `
                        <h5>Recommendations:</h5>
                        <ul>
                            ${result.aiAnalysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
        }

        resultsContent.innerHTML = html;
        resultsContent.scrollIntoView({ behavior: 'smooth' });
    }

    // Load reports
    async function loadReports() {
        try {
            const response = await fetch('/api/reports');
            const reports = await response.json();

            if (reports.length === 0) {
                reportsContainer.innerHTML = '<p class="no-reports">No reports yet. Start scanning to find vulnerabilities!</p>';
                return;
            }

            let html = '';
            reports.forEach(report => {
                html += `
                    <div class="report-card">
                        <div class="report-header">
                            <span class="report-id">${report.id}</span>
                            <span class="severity-badge severity-${report.severity}">${report.severity}</span>
                        </div>
                        <p><strong>Target:</strong> ${escapeHtml(report.target.substring(0, 80))}${report.target.length > 80 ? '...' : ''}</p>
                        <p><strong>Type:</strong> ${report.type}</p>
                        <p><strong>Vulnerabilities:</strong> ${report.vulnerabilities.length}</p>
                        <p><strong>Status:</strong> ${report.status}</p>
                        <p><strong>Created:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                    </div>
                `;
            });

            reportsContainer.innerHTML = html;
        } catch (error) {
            console.error('Failed to load reports:', error);
            reportsContainer.innerHTML = '<p class="no-reports">Failed to load reports.</p>';
        }
    }

    // Load statistics
    async function loadStatistics() {
        try {
            const response = await fetch('/api/reports');
            const reports = await response.json();

            const stats = {
                total: reports.length,
                bySeverity: {
                    critical: reports.filter(r => r.severity === 'CRITICAL').length,
                    high: reports.filter(r => r.severity === 'HIGH').length,
                    medium: reports.filter(r => r.severity === 'MEDIUM').length,
                    low: reports.filter(r => r.severity === 'LOW').length
                },
                totalVulnerabilities: reports.reduce((sum, r) => sum + r.vulnerabilities.length, 0)
            };

            const html = `
                <div class="stat-item">
                    <span>Total Reports:</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                    <span>Total Vulnerabilities:</span>
                    <span class="stat-value">${stats.totalVulnerabilities}</span>
                </div>
                <h4>By Severity:</h4>
                <div class="stat-item">
                    <span>Critical:</span>
                    <span class="stat-value" style="color: #dc3545;">${stats.bySeverity.critical}</span>
                </div>
                <div class="stat-item">
                    <span>High:</span>
                    <span class="stat-value" style="color: #fd7e14;">${stats.bySeverity.high}</span>
                </div>
                <div class="stat-item">
                    <span>Medium:</span>
                    <span class="stat-value" style="color: #ffc107;">${stats.bySeverity.medium}</span>
                </div>
                <div class="stat-item">
                    <span>Low:</span>
                    <span class="stat-value" style="color: #28a745;">${stats.bySeverity.low}</span>
                </div>
            `;

            document.getElementById('statsContent').innerHTML = html;
            statsModal.style.display = 'block';
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }

    // Event listeners
    refreshReportsBtn.addEventListener('click', loadReports);
    showStatsBtn.addEventListener('click', loadStatistics);
    
    closeModal.addEventListener('click', () => {
        statsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === statsModal) {
            statsModal.style.display = 'none';
        }
    });

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load reports on page load
    loadReports();

    // Add placeholder with example
    targetInput.placeholder = `Enter a URL (e.g., https://example.com) or paste code to scan.\n\nExample vulnerable code:\n${exampleVulnerableCode}`;
});
