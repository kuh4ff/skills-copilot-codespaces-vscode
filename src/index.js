const express = require('express');
const path = require('path');
require('dotenv').config();

const vulnerabilityScanner = require('./scanner');
const reportManager = require('./reportManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.post('/api/scan', async (req, res) => {
  try {
    const { target, type } = req.body;
    
    if (!target) {
      return res.status(400).json({ error: 'Target URL or code is required' });
    }

    const scanResult = await vulnerabilityScanner.scan(target, type);
    
    // Save to reports if vulnerabilities found
    if (scanResult.vulnerabilities.length > 0) {
      const report = reportManager.createReport({
        target,
        type,
        vulnerabilities: scanResult.vulnerabilities,
        severity: scanResult.severity,
        timestamp: new Date()
      });
      
      scanResult.reportId = report.id;
    }

    res.json(scanResult);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

app.get('/api/reports', (req, res) => {
  try {
    const reports = reportManager.getAllReports();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.get('/api/reports/:id', (req, res) => {
  try {
    const report = reportManager.getReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

app.post('/api/reports', (req, res) => {
  try {
    const report = reportManager.createReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 Bug Bounty AI App running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 Ready to scan for vulnerabilities!`);
});

module.exports = app;
