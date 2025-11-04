/**
 * AI-Powered Vulnerability Scanner
 * Uses pattern matching and heuristics to detect common security vulnerabilities
 */

class VulnerabilityScanner {
  constructor() {
    this.vulnerabilityPatterns = {
      // SQL Injection patterns
      sql_injection: {
        patterns: [
          /(\bSELECT\b.*\bFROM\b.*\bWHERE\b.*['"]\s*\+\s*)/gi,
          /(\bINSERT\b.*\bINTO\b.*\bVALUES\b.*['"]\s*\+\s*)/gi,
          /(\bUPDATE\b.*\bSET\b.*['"]\s*\+\s*)/gi,
          /(\bDELETE\b.*\bFROM\b.*\bWHERE\b.*['"]\s*\+\s*)/gi,
          /(execute|exec)\s*\(\s*['"].*\+.*['"]/gi,
          /query\s*\(\s*['"].*\+.*['"]/gi
        ],
        severity: 'CRITICAL',
        description: 'Potential SQL Injection vulnerability detected'
      },
      
      // XSS patterns
      xss: {
        patterns: [
          /<script[^>]*>.*<\/script>/gi,
          /javascript:\s*[^'"]/gi,
          /on\w+\s*=\s*['"]/gi,
          /innerHTML\s*=\s*.*\+/gi,
          /document\.write\s*\(/gi,
          /eval\s*\(/gi
        ],
        severity: 'HIGH',
        description: 'Potential Cross-Site Scripting (XSS) vulnerability detected'
      },
      
      // Insecure authentication
      auth_issues: {
        patterns: [
          /password\s*=\s*['"]/gi,
          /api[_-]?key\s*=\s*['"]/gi,
          /secret\s*=\s*['"]/gi,
          /token\s*=\s*['"](?!process\.env)/gi,
          /md5\s*\(/gi,
          /sha1\s*\(/gi
        ],
        severity: 'HIGH',
        description: 'Insecure authentication or credential handling detected'
      },
      
      // Command injection
      command_injection: {
        patterns: [
          /exec\s*\(\s*['"].*\+/gi,
          /system\s*\(\s*['"].*\+/gi,
          /shell_exec\s*\(\s*['"].*\+/gi,
          /child_process\.\w+\s*\(\s*['"].*\+/gi
        ],
        severity: 'CRITICAL',
        description: 'Potential Command Injection vulnerability detected'
      },
      
      // Path traversal
      path_traversal: {
        patterns: [
          /\.\.[\/\\]/g,
          /readFile\s*\(\s*.*\+/gi,
          /writeFile\s*\(\s*.*\+/gi
        ],
        severity: 'HIGH',
        description: 'Potential Path Traversal vulnerability detected'
      },
      
      // CSRF
      csrf: {
        patterns: [
          /method\s*=\s*['"]POST['"]/gi,
          /<form[^>]*>/gi
        ],
        severity: 'MEDIUM',
        description: 'Potential CSRF vulnerability - missing CSRF protection'
      }
    };
  }

  async scan(target, type = 'url') {
    console.log(`🔍 Scanning ${type}: ${target.substring(0, 50)}...`);
    
    const vulnerabilities = [];
    let content = target;
    
    // If it's a URL, we'll treat it as code for now (in real app, would fetch content)
    if (type === 'url') {
      // Simple URL validation
      try {
        new URL(target);
      } catch (e) {
        // Not a valid URL, treat as code
        type = 'code';
      }
    }

    // Scan for each vulnerability type
    for (const [vulnType, vulnConfig] of Object.entries(this.vulnerabilityPatterns)) {
      for (const pattern of vulnConfig.patterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          vulnerabilities.push({
            type: vulnType,
            severity: vulnConfig.severity,
            description: vulnConfig.description,
            matches: matches.slice(0, 3), // Limit to first 3 matches
            pattern: pattern.toString(),
            recommendation: this.getRecommendation(vulnType)
          });
          break; // Only report once per vulnerability type
        }
      }
    }

    // AI Analysis (simplified heuristics)
    const aiAnalysis = this.performAIAnalysis(content, vulnerabilities);

    return {
      target,
      type,
      vulnerabilities,
      totalVulnerabilities: vulnerabilities.length,
      severity: this.calculateOverallSeverity(vulnerabilities),
      aiAnalysis,
      scannedAt: new Date().toISOString()
    };
  }

  getRecommendation(vulnType) {
    const recommendations = {
      sql_injection: 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.',
      xss: 'Sanitize and encode all user input. Use Content Security Policy (CSP) headers. Avoid innerHTML and eval().',
      auth_issues: 'Store credentials in environment variables. Use strong hashing algorithms (bcrypt, Argon2). Never hardcode secrets.',
      command_injection: 'Avoid executing system commands with user input. Use input validation and whitelisting.',
      path_traversal: 'Validate and sanitize file paths. Use path.resolve() and check if resolved path is within allowed directory.',
      csrf: 'Implement CSRF tokens for state-changing operations. Use SameSite cookie attribute.'
    };
    
    return recommendations[vulnType] || 'Review and validate the flagged code for potential security issues.';
  }

  performAIAnalysis(content, vulnerabilities) {
    const analysis = {
      riskScore: 0,
      insights: [],
      recommendations: []
    };

    if (vulnerabilities.length === 0) {
      analysis.insights.push('✅ No obvious vulnerabilities detected in the provided code.');
      analysis.insights.push('🔍 However, this scan covers common patterns. Manual security review is recommended.');
      return analysis;
    }

    // Calculate risk score
    const severityScores = { CRITICAL: 10, HIGH: 7, MEDIUM: 4, LOW: 2 };
    analysis.riskScore = vulnerabilities.reduce((score, vuln) => {
      return score + (severityScores[vuln.severity] || 0);
    }, 0);

    // Generate insights
    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;

    if (criticalCount > 0) {
      analysis.insights.push(`🚨 ${criticalCount} CRITICAL vulnerability(ies) detected - immediate action required!`);
    }
    if (highCount > 0) {
      analysis.insights.push(`⚠️ ${highCount} HIGH severity vulnerability(ies) found.`);
    }

    analysis.insights.push(`📊 Overall Risk Score: ${analysis.riskScore}/100`);

    // Add general recommendations
    analysis.recommendations.push('Implement input validation and sanitization');
    analysis.recommendations.push('Follow OWASP Top 10 security guidelines');
    analysis.recommendations.push('Conduct regular security audits');

    return analysis;
  }

  calculateOverallSeverity(vulnerabilities) {
    if (vulnerabilities.length === 0) return 'NONE';
    
    const severities = vulnerabilities.map(v => v.severity);
    if (severities.includes('CRITICAL')) return 'CRITICAL';
    if (severities.includes('HIGH')) return 'HIGH';
    if (severities.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = new VulnerabilityScanner();
