/**
 * Bug Report Manager
 * Manages vulnerability reports and findings
 */

class ReportManager {
  constructor() {
    this.reports = new Map();
    this.reportCounter = 0;
  }

  createReport(data) {
    this.reportCounter++;
    const id = `REPORT-${Date.now()}-${this.reportCounter}`;
    
    const report = {
      id,
      target: data.target,
      type: data.type || 'unknown',
      vulnerabilities: data.vulnerabilities || [],
      severity: data.severity || 'UNKNOWN',
      status: 'NEW',
      timestamp: data.timestamp || new Date(),
      notes: data.notes || '',
      rewards: data.rewards || null
    };

    this.reports.set(id, report);
    console.log(`📝 Created report ${id} with ${report.vulnerabilities.length} vulnerabilities`);
    
    return report;
  }

  getReport(id) {
    return this.reports.get(id);
  }

  getAllReports() {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  updateReport(id, updates) {
    const report = this.reports.get(id);
    if (!report) {
      throw new Error(`Report ${id} not found`);
    }

    const updatedReport = { ...report, ...updates };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  deleteReport(id) {
    return this.reports.delete(id);
  }

  getReportsByStatus(status) {
    return Array.from(this.reports.values()).filter(
      report => report.status === status
    );
  }

  getReportsBySeverity(severity) {
    return Array.from(this.reports.values()).filter(
      report => report.severity === severity
    );
  }

  getStatistics() {
    const reports = Array.from(this.reports.values());
    
    return {
      total: reports.length,
      bySeverity: {
        critical: reports.filter(r => r.severity === 'CRITICAL').length,
        high: reports.filter(r => r.severity === 'HIGH').length,
        medium: reports.filter(r => r.severity === 'MEDIUM').length,
        low: reports.filter(r => r.severity === 'LOW').length
      },
      byStatus: {
        new: reports.filter(r => r.status === 'NEW').length,
        inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
        resolved: reports.filter(r => r.status === 'RESOLVED').length
      },
      totalVulnerabilities: reports.reduce((sum, r) => 
        sum + (r.vulnerabilities?.length || 0), 0
      )
    };
  }
}

module.exports = new ReportManager();
