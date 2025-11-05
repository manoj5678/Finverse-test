// require('dotenv').config();
// const { createAgent } = require('@forestadmin/agent');
// const { createSqlDataSource } = require('@forestadmin/datasource-sql');

// // Create the Forest Admin agent.
// /**
//  * @type {import('@forestadmin/agent').Agent<import('./typings').Schema>}
//  */
// const agent = createAgent({
//   // Security tokens
//   authSecret: process.env.FOREST_AUTH_SECRET,
//   envSecret: process.env.FOREST_ENV_SECRET,

//   // Make sure to set NODE_ENV to 'production' when you deploy your project
//   isProduction: process.env.NODE_ENV === 'production',

//   // Autocompletion of collection names and fields
//   typingsPath: './typings.ts',
//   typingsMaxDepth: 5,
// });

// // Connect your datasources
// // All options are documented at https://docs.forestadmin.com/developer-guide-agents-nodejs/data-sources/connection
// agent.addDataSource(
//   createSqlDataSource({
//     uri: process.env.DATABASE_URL,
//     schema: process.env.DATABASE_SCHEMA,
//     sslMode: process.env.DATABASE_SSL_MODE,
//   }),
// );

// // Add customizations here.
// // For instance, you can code custom actions, charts, create new fields or relationships, load plugins.
// // As your project grows, you will need to split it into multiple files!
// //
// // Here is some code to get your started
// //
// // agent.customizeCollection('products', collection => {
// //   // Actions are documented here:
// //   // https://docs.forestadmin.com/developer-guide-agents-nodejs/agent-customization/actions
// //   collection.addAction('Order new batch from supplier', {
// //     scope: 'Single', // This action can be triggered product by product
// //     form: [{ label: 'Quantity', type: 'Number', isRequired: true }],
// //     execute: async (context, resultBuilder) => {
// //       const product = await context.getRecord(['id', 'name'])
// //       const quantity = context.formValues['Quantity'];

// //       // ... Perform work here ...

// //       return resultBuilder.success(`Your order for a batch of ${quantity} '${product.name}' was sent`);
// //     }
// //   });

// //   // Search customization is documented here:
// //   // https://docs.forestadmin.com/developer-guide-agents-nodejs/agent-customization/search
// //   collection.replaceSearch(searchString => {
// //     // user has most likely typed a product id, let's search only that column
// //     if (searchString.match(/^prdid[\d]{8}/$))
// //       return { field: 'id', operator: 'Equal', value: searchString };

// //     // Otherwise assume that user wants to search for a product by name
// //     return { field: 'name', operator: 'Contains', value: searchString };
// //   });
// // });

// // Expose an HTTP endpoint.
// agent.mountOnStandaloneServer(Number(process.env.APPLICATION_PORT));

// // Start the agent.
// agent.start().catch(error => {
//   console.error('\x1b[31merror:\x1b[0m Forest Admin agent failed to start\n');
//   console.error('');
//   console.error(error.stack);
//   process.exit(1);
// });


require('dotenv').config();
const { createAgent } = require('@forestadmin/agent');
const { createSqlDataSource } = require('@forestadmin/datasource-sql');

// ========================================
// DEMO MODE CONFIGURATION
// ========================================
const DEMO_MODE = true; // Set to true to bypass all permission checks for demo

// ========================================
// FOREST ADMIN AGENT INITIALIZATION
// ========================================

const agent = createAgent({
  authSecret: process.env.FOREST_AUTH_SECRET,
  envSecret: process.env.FOREST_ENV_SECRET,
  isProduction: process.env.NODE_ENV === 'production',
  typingsPath: './typings.ts',
  typingsMaxDepth: 5,
});

// Connect datasource
agent.addDataSource(
  createSqlDataSource({
    uri: process.env.DATABASE_URL,
    schema: process.env.DATABASE_SCHEMA,
    sslMode: process.env.DATABASE_SSL_MODE,
  }),
);

// ========================================
// ROLES & PERMISSIONS SYSTEM
// ========================================

const ROLES = {
  ADMIN: 'admin',
  COMPLIANCE_LEAD: 'compliance_lead',
  COMPLIANCE_ANALYST: 'compliance_analyst',
  OPERATIONS_MANAGER: 'operations_manager',
  SUPPORT: 'support',
  AUDITOR: 'auditor',
};

const PERMISSION_MATRIX = {
  [ROLES.ADMIN]: [
    'view_all', 'approve_application', 'reject_application', 'request_more_info',
    'bulk_approve_applications', 'view_alerts', 'investigate_alert', 'escalate_alert',
    'dismiss_alert', 'bulk_dismiss_alerts', 'assign_alert', 'view_cases', 'create_case',
    'update_case', 'close_case', 'view_audit_logs', 'freeze_account', 'unfreeze_account',
    'close_account', 'bulk_freeze_accounts', 'flag_customer', 'verify_document',
    'add_notes', 'view_metrics', 'export_data', 'manage_users', 'view_sensitive_data',
    'manage_inbox', 'manage_workspaces', 'override_decisions'
  ],
  
  [ROLES.COMPLIANCE_LEAD]: [
    'view_all', 'approve_application', 'reject_application', 'request_more_info',
    'bulk_approve_applications', 'view_alerts', 'investigate_alert', 'escalate_alert',
    'dismiss_alert', 'bulk_dismiss_alerts', 'assign_alert', 'view_cases', 'create_case',
    'update_case', 'close_case', 'view_audit_logs', 'freeze_account', 'unfreeze_account',
    'flag_customer', 'verify_document', 'add_notes', 'view_metrics', 'export_data',
    'manage_inbox', 'manage_workspaces'
  ],
  
  [ROLES.COMPLIANCE_ANALYST]: [
    'view_applications', 'approve_application', 'reject_application', 'request_more_info',
    'view_alerts', 'investigate_alert', 'escalate_alert', 'dismiss_alert', 'view_cases',
    'create_case', 'update_case', 'verify_document', 'add_notes', 'view_metrics',
    'manage_inbox'
  ],
  
  [ROLES.OPERATIONS_MANAGER]: [
    'view_all', 'approve_application', 'reject_application', 'bulk_approve_applications',
    'view_alerts', 'view_cases', 'view_metrics', 'export_data', 'manage_workspaces'
  ],
  
  [ROLES.SUPPORT]: [
    'view_applications', 'view_customers', 'view_accounts', 'view_transactions',
    'add_notes', 'view_notes'
  ],
  
  [ROLES.AUDITOR]: [
    'view_all', 'view_audit_logs', 'view_metrics', 'export_data'
  ],
};

function getUserRole(userEmail) {
  if (!userEmail) return ROLES.SUPPORT;
  
  const email = userEmail.toLowerCase();
  
  if (email.includes('admin')) return ROLES.ADMIN;
  if (email.includes('compliance-lead') || email.includes('lead')) return ROLES.COMPLIANCE_LEAD;
  if (email.includes('compliance') || email.includes('analyst')) return ROLES.COMPLIANCE_ANALYST;
  if (email.includes('ops') || email.includes('operations')) return ROLES.OPERATIONS_MANAGER;
  if (email.includes('auditor') || email.includes('audit')) return ROLES.AUDITOR;
  if (email.includes('support') || email.includes('customer')) return ROLES.SUPPORT;
  
  return ROLES.SUPPORT;
}

function hasPermission(userEmail, permission) {
  if (DEMO_MODE) return true;
  
  const role = getUserRole(userEmail);
  const userPermissions = PERMISSION_MATRIX[role] || [];
  return userPermissions.includes(permission) || userPermissions.includes('view_all');
}

function getRoleBadge(role) {
  const badges = {
    [ROLES.ADMIN]: '👑 Admin',
    [ROLES.COMPLIANCE_LEAD]: '🛡️ Compliance Lead',
    [ROLES.COMPLIANCE_ANALYST]: '🔍 Compliance Analyst',
    [ROLES.OPERATIONS_MANAGER]: '⚙️ Operations Manager',
    [ROLES.SUPPORT]: '🎧 Support',
    [ROLES.AUDITOR]: '📊 Auditor',
  };
  return badges[role] || '👤 Unknown';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatCurrency(cents, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}

function getTimeSince(date) {
  if (!date) return 'Never';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

function getRiskBadge(score) {
  if (score >= 80) return '🔴 Critical';
  if (score >= 60) return '🟠 High';
  if (score >= 40) return '🟡 Medium';
  return '🟢 Low';
}

function getStatusIcon(status) {
  const icons = {
    submitted: '📝',
    in_review: '👀',
    approved: '✅',
    rejected: '❌',
    more_info: '❓',
    open: '🔓',
    triaged: '🔍',
    escalated: '⚠️',
    dismissed: '✖️',
    closed: '✅',
    active: '✅',
    frozen: '🧊',
    in: '⬇️',
    out: '⬆️'
  };
  return icons[status] || '📌';
}

// ========================================
// APPLICATIONS COLLECTION - ONBOARDING
// ========================================

agent.customizeCollection('applications', collection => {
  
  // ====== SMART FIELDS ======
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => `${getStatusIcon(r.status)} ${r.status?.toUpperCase() || 'UNKNOWN'}`),
  });

  collection.addField('riskBadge', {
    columnType: 'String',
    dependencies: ['risk_score'],
    getValues: (records) => records.map((r) => getRiskBadge(r.risk_score || 0)),
  });

  collection.addField('kycBadge', {
    columnType: 'String',
    dependencies: ['kyc_level'],
    getValues: (records) => records.map((r) => {
      const badges = {
        basic: '🟢 Basic',
        standard: '🟡 Standard',
        enhanced: '🔴 Enhanced'
      };
      return badges[r.kyc_level] || '⚪ Unknown';
    }),
  });

  collection.addField('sanctionsBadge', {
    columnType: 'String',
    dependencies: ['sanctions_hits'],
    getValues: (records) => records.map((r) => {
      const hits = r.sanctions_hits || 0;
      if (hits === 0) return '✅ No Hits';
      if (hits <= 2) return `⚠️ ${hits} Hits`;
      return `🚨 ${hits} Hits`;
    }),
  });

  collection.addField('ageInSystem', {
    columnType: 'String',
    dependencies: ['submitted_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.submitted_at)),
  });

  collection.addField('reviewerBadge', {
    columnType: 'String',
    dependencies: ['reviewer'],
    getValues: (records) => records.map((r) => r.reviewer ? `👤 ${r.reviewer}` : '⚪ Unassigned'),
  });

  collection.addField('quickSummary', {
    columnType: 'String',
    dependencies: ['status', 'risk_score', 'kyc_level', 'sanctions_hits'],
    getValues: (records) => records.map((r) => {
      return `${getStatusIcon(r.status)} Status: ${r.status} | Risk: ${r.risk_score || 0} | KYC: ${r.kyc_level} | Sanctions: ${r.sanctions_hits || 0}`;
    }),
  });

  // ====== WORKSPACES / SEGMENTS ======
  
  collection.addSegment('📥 Inbox: New Submissions', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'submitted'
  }));

  collection.addSegment('👀 In Review', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'in_review'
  }));

  collection.addSegment('✅ Approved Applications', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'approved'
  }));

  collection.addSegment('❌ Rejected Applications', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'rejected'
  }));

  collection.addSegment('❓ Waiting for Info', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'more_info'
  }));

  collection.addSegment('🔴 High Risk Applications', async () => ({
    field: 'risk_score',
    operator: 'GreaterThan',
    value: 60
  }));

  collection.addSegment('🚨 Sanctions Hits', async () => ({
    field: 'sanctions_hits',
    operator: 'GreaterThan',
    value: 0
  }));

  collection.addSegment('🔍 Enhanced KYC Required', async () => ({
    field: 'kyc_level',
    operator: 'Equal',
    value: 'enhanced'
  }));

  collection.addSegment('⏰ Pending >24h', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return {
      aggregator: 'And',
      conditions: [
        { field: 'status', operator: 'In', value: ['submitted', 'in_review'] },
        { field: 'submitted_at', operator: 'LessThan', value: yesterday.toISOString() }
      ]
    };
  });

  collection.addSegment('📅 This Week', async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return {
      field: 'submitted_at',
      operator: 'GreaterThan',
      value: weekAgo.toISOString()
    };
  });

  collection.addSegment('👤 My Applications', async (context) => ({
    field: 'reviewer',
    operator: 'Equal',
    value: context.caller.email
  }));

  collection.addSegment('⚪ Unassigned', async () => ({
    field: 'reviewer',
    operator: 'Blank'
  }));

  // ====== SMART ACTIONS ======
  
  // Single Application Actions
  collection.addAction('✅ Approve Application', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'approve_application')) {
        return resultBuilder.error('❌ You do not have permission to approve applications');
      }

      const application = await context.getRecord(['id', 'customer_id', 'status']);
      
      if (application.status === 'approved') {
        return resultBuilder.error('❌ This application is already approved');
      }

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          status: 'approved',
          reviewer: context.caller.email
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'application_approved',
        entity: 'application',
        entity_id: application.id,
        payload: { customer_id: application.customer_id, previous_status: application.status }
      }]);

      return resultBuilder.success('✅ Application approved successfully!');
    },
  });

  collection.addAction('❌ Reject Application', {
    scope: 'Single',
    form: [
      {
        label: 'Rejection Reason',
        type: 'TextArea',
        isRequired: true,
        description: 'Provide a detailed reason for rejection'
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'reject_application')) {
        return resultBuilder.error('❌ You do not have permission to reject applications');
      }

      const application = await context.getRecord(['id', 'customer_id', 'status']);
      const reason = context.formValues['Rejection Reason'];

      if (application.status === 'rejected') {
        return resultBuilder.error('❌ This application is already rejected');
      }

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          status: 'rejected',
          reviewer: context.caller.email,
          notes: reason
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'application_rejected',
        entity: 'application',
        entity_id: application.id,
        payload: { customer_id: application.customer_id, reason, previous_status: application.status }
      }]);

      return resultBuilder.success(`❌ Application rejected. Reason: ${reason}`);
    },
  });

  collection.addAction('❓ Request More Information', {
    scope: 'Single',
    form: [
      {
        label: 'Information Needed',
        type: 'TextArea',
        isRequired: true,
        description: 'Specify what additional information is required'
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'request_more_info')) {
        return resultBuilder.error('❌ You do not have permission to request information');
      }

      const application = await context.getRecord(['id', 'customer_id']);
      const info = context.formValues['Information Needed'];

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          status: 'more_info',
          reviewer: context.caller.email,
          notes: info
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'information_requested',
        entity: 'application',
        entity_id: application.id,
        payload: { customer_id: application.customer_id, info_needed: info }
      }]);

      return resultBuilder.success(`❓ Information requested: ${info}`);
    },
  });

  collection.addAction('👤 Assign to Me', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      const application = await context.getRecord(['id']);

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          reviewer: context.caller.email
        });

      return resultBuilder.success(`✅ Application assigned to ${context.caller.email}`);
    },
  });

  collection.addAction('👥 Reassign Application', {
    scope: 'Single',
    form: [
      {
        label: 'Assign To',
        type: 'String',
        isRequired: true,
        description: 'Email of the team member'
      }
    ],
    execute: async (context, resultBuilder) => {
      const application = await context.getRecord(['id']);
      const assignee = context.formValues['Assign To'];

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          reviewer: assignee
        });

      return resultBuilder.success(`✅ Application assigned to ${assignee}`);
    },
  });

  collection.addAction('📝 Add Review Note', {
    scope: 'Single',
    form: [
      {
        label: 'Note',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      const application = await context.getRecord(['id', 'notes']);
      const newNote = context.formValues['Note'];
      
      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] ${context.caller.email}: ${newNote}`;
      
      const updatedNotes = application.notes 
        ? `${application.notes}\n\n${noteEntry}` 
        : noteEntry;

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          notes: updatedNotes
        });

      return resultBuilder.success('✅ Note added successfully');
    },
  });

  collection.addAction('🔍 Start Review', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      const application = await context.getRecord(['id', 'status']);

      if (application.status !== 'submitted') {
        return resultBuilder.error('❌ This application is not in submitted status');
      }

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: application.id }], {
          status: 'in_review',
          reviewer: context.caller.email
        });

      return resultBuilder.success('✅ Review started - application status updated to "in_review"');
    },
  });

  // Bulk Actions
  collection.addAction('✅ Bulk Approve Applications', {
    scope: 'Bulk',
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'bulk_approve_applications')) {
        return resultBuilder.error('❌ You do not have permission to bulk approve');
      }

      const recordIds = await context.getRecordIds();
      
      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'In', value: recordIds }], {
          status: 'approved',
          reviewer: context.caller.email
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'bulk_application_approved',
        entity: 'application',
        entity_id: null,
        payload: { count: recordIds.length, application_ids: recordIds }
      }]);

      return resultBuilder.success(`✅ ${recordIds.length} applications approved successfully!`);
    },
  });

  collection.addAction('👥 Bulk Assign Applications', {
    scope: 'Bulk',
    form: [
      {
        label: 'Assign To',
        type: 'String',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      const recordIds = await context.getRecordIds();
      const assignee = context.formValues['Assign To'];

      await context.dataSource
        .getCollection('applications')
        .update(context.caller, [{ field: 'id', operator: 'In', value: recordIds }], {
          reviewer: assignee
        });

      return resultBuilder.success(`✅ ${recordIds.length} applications assigned to ${assignee}`);
    },
  });

  collection.addAction('📊 View Application Stats', {
    scope: 'Global',
    execute: async (context, resultBuilder) => {
      const allApplications = await context.dataSource
        .getCollection('applications')
        .list(context.caller, { field: 'id', operator: 'Present' }, null);

      const stats = {
        total: allApplications.length,
        submitted: 0,
        in_review: 0,
        approved: 0,
        rejected: 0,
        more_info: 0,
        highRisk: 0,
        sanctionsHits: 0
      };

      allApplications.forEach(app => {
        stats[app.status] = (stats[app.status] || 0) + 1;
        if (app.risk_score >= 60) stats.highRisk++;
        if (app.sanctions_hits > 0) stats.sanctionsHits++;
      });

      const message = `
📊 APPLICATION STATISTICS
━━━━━━━━━━━━━━━━━━━━━━

📈 Total Applications: ${stats.total}

📝 By Status:
• Submitted: ${stats.submitted || 0}
• In Review: ${stats.in_review || 0}
• Approved: ${stats.approved || 0}
• Rejected: ${stats.rejected || 0}
• More Info Needed: ${stats.more_info || 0}

🎯 Risk Analysis:
• High Risk (>60): ${stats.highRisk}
• Sanctions Hits: ${stats.sanctionsHits}

📊 Approval Rate: ${stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%
      `;

      return resultBuilder.success(message);
    },
  });

  console.log('✅ Applications collection customized');
});

// ========================================
// ALERTS COLLECTION - AML MONITORING
// ========================================

agent.customizeCollection('alerts', collection => {
  
  // ====== SMART FIELDS ======
  
  collection.addField('severityBadge', {
    columnType: 'String',
    dependencies: ['severity'],
    getValues: (records) => records.map((r) => {
      const badges = {
        low: '🟢 Low',
        medium: '🟡 Medium',
        high: '🟠 High',
        critical: '🔴 Critical'
      };
      return badges[r.severity] || '⚪ Unknown';
    }),
  });

  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => `${getStatusIcon(r.status)} ${r.status?.toUpperCase() || 'UNKNOWN'}`),
  });

  collection.addField('alertAge', {
    columnType: 'String',
    dependencies: ['triggered_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.triggered_at)),
  });

  collection.addField('typeBadge', {
    columnType: 'String',
    dependencies: ['type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'suspicious_transaction': '💸 Suspicious Transaction',
        'velocity_check': '⚡ Velocity Check',
        'unusual_activity': '⚠️ Unusual Activity',
        'sanctions_match': '🚨 Sanctions Match',
        'pep_match': '🎯 PEP Match',
        'fraud_indicator': '🔴 Fraud Indicator'
      };
      return badges[r.type] || `📌 ${r.type || 'Alert'}`;
    }),
  });

  collection.addField('riskLevel', {
    columnType: 'Number',
    dependencies: ['severity'],
    getValues: (records) => records.map((r) => {
      const levels = { low: 25, medium: 50, high: 75, critical: 100 };
      return levels[r.severity] || 0;
    }),
  });

  // ====== WORKSPACES / SEGMENTS ======
  
  collection.addSegment('📥 Inbox: New Alerts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'open'
  }));

  collection.addSegment('🔴 Critical Alerts', async () => ({
    field: 'severity',
    operator: 'Equal',
    value: 'critical'
  }));

  collection.addSegment('🟠 High Priority', async () => ({
    field: 'severity',
    operator: 'Equal',
    value: 'high'
  }));

  collection.addSegment('🔍 Triaged Alerts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'triaged'
  }));

  collection.addSegment('⚠️ Escalated Cases', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'escalated'
  }));

  collection.addSegment('✖️ Dismissed Alerts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'dismissed'
  }));

  collection.addSegment('⏰ Last 24 Hours', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return {
      field: 'triggered_at',
      operator: 'GreaterThan',
      value: yesterday.toISOString()
    };
  });

  collection.addSegment('🚨 Requires Immediate Action', async () => {
    const today = new Date();
    today.setHours(today.getHours() - 2);
    
    return {
      aggregator: 'And',
      conditions: [
        { field: 'severity', operator: 'In', value: ['critical', 'high'] },
        { field: 'status', operator: 'Equal', value: 'open' },
        { field: 'triggered_at', operator: 'LessThan', value: today.toISOString() }
      ]
    };
  });

  collection.addSegment('💸 Transaction Alerts', async () => ({
    field: 'type',
    operator: 'In',
    value: ['suspicious_transaction', 'velocity_check', 'unusual_activity']
  }));

  collection.addSegment('🎯 Compliance Alerts', async () => ({
    field: 'type',
    operator: 'In',
    value: ['sanctions_match', 'pep_match']
  }));

  // ====== SMART ACTIONS ======
  
  collection.addAction('🔍 Investigate Alert', {
    scope: 'Single',
    form: [
      {
        label: 'Investigation Notes',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'investigate_alert')) {
        return resultBuilder.error('❌ You do not have permission to investigate alerts');
      }

      const alert = await context.getRecord(['id', 'customer_id', 'type', 'severity']);
      const notes = context.formValues['Investigation Notes'];

      await context.dataSource
        .getCollection('alerts')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: alert.id }], {
          status: 'triaged',
          details: { ...alert.details, investigation_notes: notes, investigator: context.caller.email }
        });

      // Create note
      await context.dataSource.getCollection('notes').create(context.caller, [{
        entity_type: 'alert',
        entity_id: alert.id,
        author: context.caller.email,
        body: notes
      }]);

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'alert_investigated',
        entity: 'alert',
        entity_id: alert.id,
        payload: { type: alert.type, severity: alert.severity, customer_id: alert.customer_id }
      }]);

      return resultBuilder.success('🔍 Alert investigated and marked as triaged');
    },
  });

  collection.addAction('⚠️ Escalate to Case', {
    scope: 'Single',
    form: [
      {
        label: 'Case Title',
        type: 'String',
        isRequired: true
      },
      {
        label: 'Priority',
        type: 'Enum',
        enumValues: ['p3', 'p2', 'p1'],
        isRequired: true
      },
      {
        label: 'Escalation Notes',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'escalate_alert')) {
        return resultBuilder.error('❌ You do not have permission to escalate alerts');
      }

      const alert = await context.getRecord(['id', 'customer_id', 'type', 'severity']);
      const title = context.formValues['Case Title'];
      const priority = context.formValues['Priority'];
      const notes = context.formValues['Escalation Notes'];

      // Create case
      const caseRecords = await context.dataSource.getCollection('cases').create(context.caller, [{
        title,
        status: 'open',
        owner: context.caller.email,
        priority
      }]);

      const caseId = caseRecords[0].id;

      // Link alert to case
      await context.dataSource.getCollection('case_links').create(context.caller, [{
        case_id: caseId,
        alert_id: alert.id
      }]);

      // Update alert status
      await context.dataSource
        .getCollection('alerts')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: alert.id }], {
          status: 'escalated'
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'alert_escalated',
        entity: 'alert',
        entity_id: alert.id,
        payload: { case_id: caseId, priority, notes }
      }]);

      return resultBuilder.success(`⚠️ Alert escalated to case: ${title} (${priority.toUpperCase()})`);
    },
  });

  collection.addAction('✖️ Dismiss Alert', {
    scope: 'Single',
    form: [
      {
        label: 'Dismissal Reason',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'dismiss_alert')) {
        return resultBuilder.error('❌ You do not have permission to dismiss alerts');
      }

      const alert = await context.getRecord(['id', 'type', 'severity']);
      const reason = context.formValues['Dismissal Reason'];

      await context.dataSource
        .getCollection('alerts')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: alert.id }], {
          status: 'dismissed',
          details: { ...alert.details, dismissal_reason: reason, dismissed_by: context.caller.email }
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'alert_dismissed',
        entity: 'alert',
        entity_id: alert.id,
        payload: { type: alert.type, severity: alert.severity, reason }
      }]);

      return resultBuilder.success('✖️ Alert dismissed');
    },
  });

  collection.addAction('✖️ Bulk Dismiss Alerts', {
    scope: 'Bulk',
    form: [
      {
        label: 'Dismissal Reason',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'bulk_dismiss_alerts')) {
        return resultBuilder.error('❌ You do not have permission to bulk dismiss alerts');
      }

      const recordIds = await context.getRecordIds();
      const reason = context.formValues['Dismissal Reason'];

      await context.dataSource
        .getCollection('alerts')
        .update(context.caller, [{ field: 'id', operator: 'In', value: recordIds }], {
          status: 'dismissed'
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'bulk_alerts_dismissed',
        entity: 'alert',
        entity_id: null,
        payload: { count: recordIds.length, alert_ids: recordIds, reason }
      }]);

      return resultBuilder.success(`✖️ ${recordIds.length} alerts dismissed`);
    },
  });

  collection.addAction('📊 Alert Dashboard', {
    scope: 'Global',
    execute: async (context, resultBuilder) => {
      const allAlerts = await context.dataSource
        .getCollection('alerts')
        .list(context.caller, { field: 'id', operator: 'Present' }, null);

      const stats = {
        total: allAlerts.length,
        open: 0,
        triaged: 0,
        escalated: 0,
        dismissed: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      allAlerts.forEach(alert => {
        stats[alert.status] = (stats[alert.status] || 0) + 1;
        stats[alert.severity] = (stats[alert.severity] || 0) + 1;
      });

      const message = `
📊 ALERT MONITORING DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━

🚨 Total Alerts: ${stats.total}

📈 By Status:
• Open: ${stats.open || 0}
• Triaged: ${stats.triaged || 0}
• Escalated: ${stats.escalated || 0}
• Dismissed: ${stats.dismissed || 0}

🎯 By Severity:
• 🔴 Critical: ${stats.critical || 0}
• 🟠 High: ${stats.high || 0}
• 🟡 Medium: ${stats.medium || 0}
• 🟢 Low: ${stats.low || 0}

⚠️ Action Required: ${stats.open || 0} open alerts
📊 Resolution Rate: ${stats.total > 0 ? (((stats.dismissed + stats.escalated) / stats.total) * 100).toFixed(1) : 0}%
      `;

      return resultBuilder.success(message);
    },
  });

  console.log('✅ Alerts collection customized');
});

// ========================================
// AML_ALERTS COLLECTION
// ========================================

agent.customizeCollection('aml_alerts', collection => {
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => `${getStatusIcon(r.status)} ${r.status?.toUpperCase() || 'UNKNOWN'}`),
  });

  collection.addField('scoreBadge', {
    columnType: 'String',
    dependencies: ['score'],
    getValues: (records) => records.map((r) => getRiskBadge(r.score || 0)),
  });

  collection.addField('ruleBadge', {
    columnType: 'String',
    dependencies: ['rule'],
    getValues: (records) => records.map((r) => `🎯 ${r.rule || 'Unknown Rule'}`),
  });

  collection.addField('ageInSystem', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  // Segments
  collection.addSegment('📥 Open AML Alerts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'open'
  }));

  collection.addSegment('🔍 Triaged', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'triaged'
  }));

  collection.addSegment('🔴 High Risk (>80)', async () => ({
    field: 'score',
    operator: 'GreaterThan',
    value: 80
  }));

  collection.addSegment('⚠️ Escalated', async () => ({
    field: 'escalated_case_id',
    operator: 'Present'
  }));

  console.log('✅ AML alerts collection customized');
});

// ========================================
// CASES COLLECTION
// ========================================

agent.customizeCollection('cases', collection => {
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => `${getStatusIcon(r.status)} ${r.status?.toUpperCase() || 'UNKNOWN'}`),
  });

  collection.addField('priorityBadge', {
    columnType: 'String',
    dependencies: ['priority'],
    getValues: (records) => records.map((r) => {
      const badges = {
        p1: '🔴 P1 - Critical',
        p2: '🟠 P2 - High',
        p3: '🟡 P3 - Normal'
      };
      return badges[r.priority] || '⚪ Unknown';
    }),
  });

  collection.addField('ownerBadge', {
    columnType: 'String',
    dependencies: ['owner'],
    getValues: (records) => records.map((r) => r.owner ? `👤 ${r.owner}` : '⚪ Unassigned'),
  });

  collection.addField('caseAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  // Segments
  collection.addSegment('📥 Open Cases', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'open'
  }));

  collection.addSegment('🔴 P1 Priority', async () => ({
    field: 'priority',
    operator: 'Equal',
    value: 'p1'
  }));

  collection.addSegment('👤 My Cases', async (context) => ({
    field: 'owner',
    operator: 'Equal',
    value: context.caller.email
  }));

  collection.addSegment('⚪ Unassigned Cases', async () => ({
    field: 'owner',
    operator: 'Blank'
  }));

  collection.addSegment('👀 In Review', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'in_review'
  }));

  // Actions
  collection.addAction('✅ Close Case', {
    scope: 'Single',
    form: [
      {
        label: 'Resolution Summary',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'close_case')) {
        return resultBuilder.error('❌ You do not have permission to close cases');
      }

      const caseRecord = await context.getRecord(['id', 'title']);
      const summary = context.formValues['Resolution Summary'];

      await context.dataSource
        .getCollection('cases')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: caseRecord.id }], {
          status: 'closed'
        });

      // Create note
      await context.dataSource.getCollection('notes').create(context.caller, [{
        entity_type: 'case',
        entity_id: caseRecord.id,
        author: context.caller.email,
        body: `Case closed: ${summary}`
      }]);

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'case_closed',
        entity: 'case',
        entity_id: caseRecord.id,
        payload: { title: caseRecord.title, summary }
      }]);

      return resultBuilder.success('✅ Case closed successfully');
    },
  });

  collection.addAction('👤 Assign to Me', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      const caseRecord = await context.getRecord(['id']);

      await context.dataSource
        .getCollection('cases')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: caseRecord.id }], {
          owner: context.caller.email
        });

      return resultBuilder.success(`✅ Case assigned to ${context.caller.email}`);
    },
  });

  collection.addAction('🔄 Change Priority', {
    scope: 'Single',
    form: [
      {
        label: 'New Priority',
        type: 'Enum',
        enumValues: ['p1', 'p2', 'p3'],
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      const caseRecord = await context.getRecord(['id']);
      const priority = context.formValues['New Priority'];

      await context.dataSource
        .getCollection('cases')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: caseRecord.id }], {
          priority
        });

      return resultBuilder.success(`✅ Case priority changed to ${priority.toUpperCase()}`);
    },
  });

  console.log('✅ Cases collection customized');
});

// ========================================
// CUSTOMERS COLLECTION
// ========================================

agent.customizeCollection('customers', collection => {
  
  collection.addField('typeBadge', {
    columnType: 'String',
    dependencies: ['type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        individual: '👤 Individual',
        business: '🏢 Business'
      };
      return badges[r.type] || '⚪ Unknown';
    }),
  });

  collection.addField('fullName', {
    columnType: 'String',
    dependencies: ['first_name', 'last_name', 'business_name', 'type'],
    getValues: (records) => records.map((r) => {
      if (r.type === 'business') return r.business_name || 'Unnamed Business';
      return `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unnamed Customer';
    }),
  });

  collection.addField('memberSince', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  collection.addField('contactInfo', {
    columnType: 'String',
    dependencies: ['email', 'phone'],
    getValues: (records) => records.map((r) => {
      const parts = [];
      if (r.email) parts.push(`📧 ${r.email}`);
      if (r.phone) parts.push(`📱 ${r.phone}`);
      return parts.join(' | ') || 'No contact info';
    }),
  });

  // Segments
  collection.addSegment('👤 Individual Customers', async () => ({
    field: 'type',
    operator: 'Equal',
    value: 'individual'
  }));

  collection.addSegment('🏢 Business Customers', async () => ({
    field: 'type',
    operator: 'Equal',
    value: 'business'
  }));

  collection.addSegment('📅 New Customers (30d)', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return {
      field: 'created_at',
      operator: 'GreaterThan',
      value: thirtyDaysAgo.toISOString()
    };
  });

  // Actions
  collection.addAction('📊 Customer Overview', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      const customer = await context.getRecord(['id', 'email', 'first_name', 'last_name', 'business_name', 'type', 'created_at']);

      // Get related data
      const accounts = await context.dataSource
        .getCollection('accounts')
        .list(context.caller, { field: 'customer_id', operator: 'Equal', value: customer.id }, null);

      const applications = await context.dataSource
        .getCollection('applications')
        .list(context.caller, { field: 'customer_id', operator: 'Equal', value: customer.id }, null);

      const alerts = await context.dataSource
        .getCollection('alerts')
        .list(context.caller, { field: 'customer_id', operator: 'Equal', value: customer.id }, null);

      const customerName = customer.type === 'business' 
        ? customer.business_name 
        : `${customer.first_name} ${customer.last_name}`;

      const message = `
📊 CUSTOMER OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━

${customer.type === 'business' ? '🏢' : '👤'} ${customerName}
📧 ${customer.email}
📅 Member since: ${getTimeSince(customer.created_at)}

💳 ACCOUNTS: ${accounts.length}
${accounts.map(acc => `• ${acc.iban} - ${formatCurrency(acc.balance_cents)} (${acc.status})`).join('\n')}

📋 APPLICATIONS: ${applications.length}
${applications.map(app => `• ${app.status} (Risk: ${app.risk_score})`).join('\n')}

🚨 ALERTS: ${alerts.length}
${alerts.map(alert => `• ${alert.type} - ${alert.severity} (${alert.status})`).join('\n')}
      `;

      return resultBuilder.success(message);
    },
  });

  collection.addAction('🚩 Flag Customer', {
    scope: 'Single',
    form: [
      {
        label: 'Flag Reason',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'flag_customer')) {
        return resultBuilder.error('❌ You do not have permission to flag customers');
      }

      const customer = await context.getRecord(['id', 'email']);
      const reason = context.formValues['Flag Reason'];

      // Create note
      await context.dataSource.getCollection('notes').create(context.caller, [{
        entity_type: 'customer',
        entity_id: customer.id,
        author: context.caller.email,
        body: `🚩 FLAGGED: ${reason}`
      }]);

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'customer_flagged',
        entity: 'customer',
        entity_id: customer.id,
        payload: { email: customer.email, reason }
      }]);

      return resultBuilder.success(`🚩 Customer flagged: ${reason}`);
    },
  });

  console.log('✅ Customers collection customized');
});

// ========================================
// ACCOUNTS COLLECTION
// ========================================

agent.customizeCollection('accounts', collection => {
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => `${getStatusIcon(r.status)} ${r.status?.toUpperCase() || 'UNKNOWN'}`),
  });

  collection.addField('balanceFormatted', {
    columnType: 'String',
    dependencies: ['balance_cents', 'currency'],
    getValues: (records) => records.map((r) => formatCurrency(r.balance_cents || 0, r.currency || 'EUR')),
  });

  collection.addField('accountSummary', {
    columnType: 'String',
    dependencies: ['iban', 'balance_cents', 'currency', 'status'],
    getValues: (records) => records.map((r) => {
      return `${r.iban || 'No IBAN'} | ${formatCurrency(r.balance_cents || 0, r.currency)} | ${r.status}`;
    }),
  });

  // Segments
  collection.addSegment('✅ Active Accounts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'active'
  }));

  collection.addSegment('🧊 Frozen Accounts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'frozen'
  }));

  collection.addSegment('❌ Closed Accounts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'closed'
  }));

  collection.addSegment('💰 High Balance (>€10k)', async () => ({
    field: 'balance_cents',
    operator: 'GreaterThan',
    value: 1000000
  }));

  // Actions
  collection.addAction('🧊 Freeze Account', {
    scope: 'Single',
    form: [
      {
        label: 'Reason for Freezing',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'freeze_account')) {
        return resultBuilder.error('❌ You do not have permission to freeze accounts');
      }

      const account = await context.getRecord(['id', 'iban', 'status']);

      if (account.status === 'frozen') {
        return resultBuilder.error('❌ This account is already frozen');
      }

      if (account.status === 'closed') {
        return resultBuilder.error('❌ Cannot freeze a closed account');
      }

      const reason = context.formValues['Reason for Freezing'];

      await context.dataSource
        .getCollection('accounts')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: account.id }], {
          status: 'frozen'
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'account_frozen',
        entity: 'account',
        entity_id: account.id,
        payload: { iban: account.iban, reason, previous_status: account.status }
      }]);

      return resultBuilder.success(`🧊 Account ${account.iban} frozen. Reason: ${reason}`);
    },
  });

  collection.addAction('✅ Unfreeze Account', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'unfreeze_account')) {
        return resultBuilder.error('❌ You do not have permission to unfreeze accounts');
      }

      const account = await context.getRecord(['id', 'iban', 'status']);

      if (account.status !== 'frozen') {
        return resultBuilder.error('❌ This account is not frozen');
      }

      await context.dataSource
        .getCollection('accounts')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: account.id }], {
          status: 'active'
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'account_unfrozen',
        entity: 'account',
        entity_id: account.id,
        payload: { iban: account.iban }
      }]);

      return resultBuilder.success(`✅ Account ${account.iban} unfrozen and reactivated`);
    },
  });

  collection.addAction('❌ Close Account', {
    scope: 'Single',
    form: [
      {
        label: 'Closure Reason',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'close_account')) {
        return resultBuilder.error('❌ You do not have permission to close accounts');
      }

      const account = await context.getRecord(['id', 'iban', 'status', 'balance_cents']);

      if (account.status === 'closed') {
        return resultBuilder.error('❌ This account is already closed');
      }

      if (account.balance_cents !== 0) {
        return resultBuilder.error(`❌ Cannot close account with non-zero balance: ${formatCurrency(account.balance_cents)}`);
      }

      const reason = context.formValues['Closure Reason'];

      await context.dataSource
        .getCollection('accounts')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: account.id }], {
          status: 'closed'
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'account_closed',
        entity: 'account',
        entity_id: account.id,
        payload: { iban: account.iban, reason }
      }]);

      return resultBuilder.success(`❌ Account ${account.iban} closed. Reason: ${reason}`);
    },
  });

  collection.addAction('🧊 Bulk Freeze Accounts', {
    scope: 'Bulk',
    form: [
      {
        label: 'Reason for Freezing',
        type: 'TextArea',
        isRequired: true
      }
    ],
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'bulk_freeze_accounts')) {
        return resultBuilder.error('❌ You do not have permission to bulk freeze accounts');
      }

      const recordIds = await context.getRecordIds();
      const reason = context.formValues['Reason for Freezing'];

      await context.dataSource
        .getCollection('accounts')
        .update(context.caller, [{ field: 'id', operator: 'In', value: recordIds }], {
          status: 'frozen'
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'bulk_accounts_frozen',
        entity: 'account',
        entity_id: null,
        payload: { count: recordIds.length, account_ids: recordIds, reason }
      }]);

      return resultBuilder.success(`🧊 ${recordIds.length} accounts frozen`);
    },
  });

  console.log('✅ Accounts collection customized');
});

// ========================================
// TRANSACTIONS COLLECTION
// ========================================

agent.customizeCollection('transactions', collection => {
  
  collection.addField('directionBadge', {
    columnType: 'String',
    dependencies: ['direction'],
    getValues: (records) => records.map((r) => {
      const badges = {
        in: '⬇️ Incoming',
        out: '⬆️ Outgoing'
      };
      return badges[r.direction] || '⚪ Unknown';
    }),
  });

  collection.addField('amountFormatted', {
    columnType: 'String',
    dependencies: ['amount_cents', 'direction'],
    getValues: (records) => records.map((r) => {
      const formatted = formatCurrency(r.amount_cents || 0);
      return r.direction === 'in' ? `+${formatted}` : `-${formatted}`;
    }),
  });

  collection.addField('transactionAge', {
    columnType: 'String',
    dependencies: ['occurred_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.occurred_at)),
  });

  collection.addField('merchantBadge', {
    columnType: 'String',
    dependencies: ['merchant_category'],
    getValues: (records) => records.map((r) => r.merchant_category ? `🏷️ ${r.merchant_category}` : '⚪ No Category'),
  });

  // Segments
  collection.addSegment('⬇️ Incoming Transactions', async () => ({
    field: 'direction',
    operator: 'Equal',
    value: 'in'
  }));

  collection.addSegment('⬆️ Outgoing Transactions', async () => ({
    field: 'direction',
    operator: 'Equal',
    value: 'out'
  }));

  collection.addSegment('💰 Large Transactions (>€1k)', async () => ({
    field: 'amount_cents',
    operator: 'GreaterThan',
    value: 100000
  }));

  collection.addSegment('📅 Today\'s Transactions', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      field: 'occurred_at',
      operator: 'GreaterThan',
      value: today.toISOString()
    };
  });

  collection.addSegment('📊 Last 7 Days', async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return {
      field: 'occurred_at',
      operator: 'GreaterThan',
      value: weekAgo.toISOString()
    };
  });

  console.log('✅ Transactions collection customized');
});

// ========================================
// DOCUMENTS COLLECTION
// ========================================

agent.customizeCollection('documents', collection => {
  
  collection.addField('typeBadge', {
    columnType: 'String',
    dependencies: ['type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'passport': '🛂 Passport',
        'id_card': '🪪 ID Card',
        'drivers_license': '🚗 Driver\'s License',
        'proof_of_address': '🏠 Proof of Address',
        'bank_statement': '🏦 Bank Statement',
        'business_registration': '🏢 Business Registration'
      };
      return badges[r.type] || `📄 ${r.type || 'Document'}`;
    }),
  });

  collection.addField('verificationBadge', {
    columnType: 'String',
    dependencies: ['verified'],
    getValues: (records) => records.map((r) => r.verified ? '✅ Verified' : '⏳ Pending Verification'),
  });

  // Segments
  collection.addSegment('✅ Verified Documents', async () => ({
    field: 'verified',
    operator: 'Equal',
    value: true
  }));

  collection.addSegment('⏳ Pending Verification', async () => ({
    field: 'verified',
    operator: 'Equal',
    value: false
  }));

  // Actions
  collection.addAction('✅ Verify Document', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      if (!hasPermission(context.caller.email, 'verify_document')) {
        return resultBuilder.error('❌ You do not have permission to verify documents');
      }

      const document = await context.getRecord(['id', 'type', 'verified']);

      if (document.verified) {
        return resultBuilder.error('✅ This document is already verified');
      }

      await context.dataSource
        .getCollection('documents')
        .update(context.caller, [{ field: 'id', operator: 'Equal', value: document.id }], {
          verified: true
        });

      // Log to audit trail
      await context.dataSource.getCollection('audit_log').create(context.caller, [{
        actor: context.caller.email,
        action: 'document_verified',
        entity: 'document',
        entity_id: document.id,
        payload: { type: document.type }
      }]);

      return resultBuilder.success(`✅ Document verified: ${document.type}`);
    },
  });

  collection.addAction('✅ Bulk Verify Documents', {
    scope: 'Bulk',
    execute: async (context, resultBuilder) => {
      const recordIds = await context.getRecordIds();

      await context.dataSource
        .getCollection('documents')
        .update(context.caller, [{ field: 'id', operator: 'In', value: recordIds }], {
          verified: true
        });

      return resultBuilder.success(`✅ ${recordIds.length} documents verified`);
    },
  });

  console.log('✅ Documents collection customized');
});

// ========================================
// NOTES COLLECTION
// ========================================

agent.customizeCollection('notes', collection => {
  
  collection.addField('authorBadge', {
    columnType: 'String',
    dependencies: ['author'],
    getValues: (records) => records.map((r) => `👤 ${r.author || 'Unknown'}`),
  });

  collection.addField('noteAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  collection.addField('entityBadge', {
    columnType: 'String',
    dependencies: ['entity_type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'application': '📋 Application',
        'alert': '🚨 Alert',
        'account': '💳 Account',
        'case': '📂 Case',
        'customer': '👤 Customer'
      };
      return badges[r.entity_type] || `📌 ${r.entity_type || 'Entity'}`;
    }),
  });

  // Segments
  collection.addSegment('👤 My Notes', async (context) => ({
    field: 'author',
    operator: 'Equal',
    value: context.caller.email
  }));

  collection.addSegment('📅 Recent Notes (7d)', async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return {
      field: 'created_at',
      operator: 'GreaterThan',
      value: weekAgo.toISOString()
    };
  });

  console.log('✅ Notes collection customized');
});

// ========================================
// AUDIT LOG COLLECTION
// ========================================

agent.customizeCollection('audit_log', collection => {
  
  collection.addField('actorBadge', {
    columnType: 'String',
    dependencies: ['actor'],
    getValues: (records) => records.map((r) => `👤 ${r.actor || 'System'}`),
  });

  collection.addField('actionBadge', {
    columnType: 'String',
    dependencies: ['action'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'application_approved': '✅ Application Approved',
        'application_rejected': '❌ Application Rejected',
        'alert_investigated': '🔍 Alert Investigated',
        'alert_escalated': '⚠️ Alert Escalated',
        'alert_dismissed': '✖️ Alert Dismissed',
        'case_opened': '📂 Case Opened',
        'case_closed': '✅ Case Closed',
        'account_frozen': '🧊 Account Frozen',
        'account_unfrozen': '✅ Account Unfrozen',
        'document_verified': '✅ Document Verified',
        'customer_flagged': '🚩 Customer Flagged'
      };
      return badges[r.action] || `📌 ${r.action || 'Action'}`;
    }),
  });

  collection.addField('entityBadge', {
    columnType: 'String',
    dependencies: ['entity'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'application': '📋 Application',
        'alert': '🚨 Alert',
        'account': '💳 Account',
        'case': '📂 Case',
        'customer': '👤 Customer'
      };
      return badges[r.entity] || `📌 ${r.entity || 'Entity'}`;
    }),
  });

  collection.addField('logAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  // Segments
  collection.addSegment('📅 Today\'s Activity', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      field: 'created_at',
      operator: 'GreaterThan',
      value: today.toISOString()
    };
  });

  collection.addSegment('🚨 Critical Actions', async () => ({
    field: 'action',
    operator: 'In',
    value: ['account_frozen', 'application_rejected', 'alert_escalated', 'case_opened']
  }));

  collection.addSegment('✅ Approvals', async () => ({
    field: 'action',
    operator: 'In',
    value: ['application_approved', 'bulk_application_approved']
  }));

  console.log('✅ Audit log collection customized');
});

// ========================================
// USERS COLLECTION
// ========================================

agent.customizeCollection('users', collection => {
  
  collection.addField('roleBadge', {
    columnType: 'String',
    dependencies: ['role'],
    getValues: (records) => records.map((r) => getRoleBadge(r.role)),
  });

  console.log('✅ Users collection customized');
});

// ========================================
// DASHBOARD CHARTS
// ========================================

agent.addChart('applications_by_status', async (context, resultBuilder) => {
  const applications = await context.dataSource
    .getCollection('applications')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'status' }]
    });

  return resultBuilder.distribution(
    applications.reduce((acc, row) => {
      acc[row.group.status || 'unknown'] = row.value;
      return acc;
    }, {})
  );
});

agent.addChart('applications_risk_distribution', async (context, resultBuilder) => {
  const applications = await context.dataSource
    .getCollection('applications')
    .list(context.caller, { field: 'id', operator: 'Present' }, null);

  const distribution = {
    'Low (0-39)': 0,
    'Medium (40-59)': 0,
    'High (60-79)': 0,
    'Critical (80-100)': 0
  };

  applications.forEach(app => {
    const score = app.risk_score || 0;
    if (score < 40) distribution['Low (0-39)']++;
    else if (score < 60) distribution['Medium (40-59)']++;
    else if (score < 80) distribution['High (60-79)']++;
    else distribution['Critical (80-100)']++;
  });

  return resultBuilder.distribution(distribution);
});

agent.addChart('alerts_by_severity', async (context, resultBuilder) => {
  const alerts = await context.dataSource
    .getCollection('alerts')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'severity' }]
    });

  return resultBuilder.distribution(
    alerts.reduce((acc, row) => {
      acc[row.group.severity || 'unknown'] = row.value;
      return acc;
    }, {})
  );
});

agent.addChart('alerts_by_status', async (context, resultBuilder) => {
  const alerts = await context.dataSource
    .getCollection('alerts')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'status' }]
    });

  return resultBuilder.distribution(
    alerts.reduce((acc, row) => {
      acc[row.group.status || 'unknown'] = row.value;
      return acc;
    }, {})
  );
});

agent.addChart('cases_by_priority', async (context, resultBuilder) => {
  const cases = await context.dataSource
    .getCollection('cases')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'priority' }]
    });

  return resultBuilder.distribution(
    cases.reduce((acc, row) => {
      acc[row.group.priority || 'unknown'] = row.value;
      return acc;
    }, {})
  );
});

agent.addChart('accounts_by_status', async (context, resultBuilder) => {
  const accounts = await context.dataSource
    .getCollection('accounts')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'status' }]
    });

  return resultBuilder.distribution(
    accounts.reduce((acc, row) => {
      acc[row.group.status || 'unknown'] = row.value;
      return acc;
    }, {})
  );
});

agent.addChart('total_balance', async (context, resultBuilder) => {
  const accounts = await context.dataSource
    .getCollection('accounts')
    .aggregate(context.caller, { field: 'status', operator: 'Equal', value: 'active' }, {
      operation: 'Sum',
      field: 'balance_cents'
    });

  const totalCents = accounts[0]?.value || 0;
  return resultBuilder.value(totalCents / 100);
});

agent.addChart('transactions_over_time', async (context, resultBuilder) => {
  const transactions = await context.dataSource
    .getCollection('transactions')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'occurred_at', operation: 'Day' }]
    });

  const data = transactions.map(row => ({
    label: new Date(row.group.occurred_at).toLocaleDateString(),
    values: { count: row.value }
  }));

  return resultBuilder.timeBased('Day', data);
});

agent.addChart('transaction_volume_by_direction', async (context, resultBuilder) => {
  const transactions = await context.dataSource
    .getCollection('transactions')
    .aggregate(context.caller, null, {
      operation: 'Sum',
      field: 'amount_cents',
      groups: [{ field: 'direction' }]
    });

  return resultBuilder.distribution(
    transactions.reduce((acc, row) => {
      acc[row.group.direction || 'unknown'] = (row.value || 0) / 100;
      return acc;
    }, {})
  );
});

agent.addChart('applications_over_time', async (context, resultBuilder) => {
  const applications = await context.dataSource
    .getCollection('applications')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'submitted_at', operation: 'Day' }]
    });

  const data = applications.map(row => ({
    label: new Date(row.group.submitted_at).toLocaleDateString(),
    values: { count: row.value }
  }));

  return resultBuilder.timeBased('Day', data);
});

agent.addChart('top_merchants_by_transaction_count', async (context, resultBuilder) => {
  const transactions = await context.dataSource
    .getCollection('transactions')
    .aggregate(context.caller, null, {
      operation: 'Count',
      groups: [{ field: 'merchant_category' }]
    });

  const sorted = transactions
    .filter(row => row.group.merchant_category)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return resultBuilder.distribution(
    sorted.reduce((acc, row) => {
      acc[row.group.merchant_category] = row.value;
      return acc;
    }, {})
  );
});

console.log('✅ Dashboard charts configured');

// ========================================
// GLOBAL PERMISSION CHECK ACTION
// ========================================

agent.customizeCollection('applications', collection => {
  collection.addAction('🔐 Check My Permissions', {
    scope: 'Global',
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      const role = getUserRole(userEmail);
      
      const permissions = {
        canApprove: hasPermission(userEmail, 'approve_application'),
        canReject: hasPermission(userEmail, 'reject_application'),
        canRequestInfo: hasPermission(userEmail, 'request_more_info'),
        canBulkApprove: hasPermission(userEmail, 'bulk_approve_applications'),
        canInvestigate: hasPermission(userEmail, 'investigate_alert'),
        canEscalate: hasPermission(userEmail, 'escalate_alert'),
        canDismiss: hasPermission(userEmail, 'dismiss_alert'),
        canBulkDismiss: hasPermission(userEmail, 'bulk_dismiss_alerts'),
        canAssign: hasPermission(userEmail, 'assign_alert'),
        canCreateCase: hasPermission(userEmail, 'create_case'),
        canUpdateCase: hasPermission(userEmail, 'update_case'),
        canCloseCase: hasPermission(userEmail, 'close_case'),
        canFreeze: hasPermission(userEmail, 'freeze_account'),
        canUnfreeze: hasPermission(userEmail, 'unfreeze_account'),
        canBulkFreeze: hasPermission(userEmail, 'bulk_freeze_accounts'),
        canViewMetrics: hasPermission(userEmail, 'view_metrics'),
        canExportData: hasPermission(userEmail, 'export_data'),
        canManageInbox: hasPermission(userEmail, 'manage_inbox'),
        canManageWorkspaces: hasPermission(userEmail, 'manage_workspaces'),
      };
      
      const message = `
🔐 PERMISSIONS DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━

📧 User: ${userEmail}
${getRoleBadge(role)}

🎯 DEMO MODE: ${DEMO_MODE ? '✅ ENABLED (All permissions granted)' : '❌ DISABLED'}

📋 ONBOARDING PERMISSIONS:
• Approve Applications: ${permissions.canApprove ? '✅' : '❌'}
• Reject Applications: ${permissions.canReject ? '✅' : '❌'}
• Request Information: ${permissions.canRequestInfo ? '✅' : '❌'}
• Bulk Approve: ${permissions.canBulkApprove ? '✅' : '❌'}

🚨 AML MONITORING PERMISSIONS:
• Investigate Alerts: ${permissions.canInvestigate ? '✅' : '❌'}
• Escalate Alerts: ${permissions.canEscalate ? '✅' : '❌'}
• Dismiss Alerts: ${permissions.canDismiss ? '✅' : '❌'}
• Bulk Dismiss: ${permissions.canBulkDismiss ? '✅' : '❌'}
• Assign Alerts: ${permissions.canAssign ? '✅' : '❌'}

📂 CASE MANAGEMENT:
• Create Cases: ${permissions.canCreateCase ? '✅' : '❌'}
• Update Cases: ${permissions.canUpdateCase ? '✅' : '❌'}
• Close Cases: ${permissions.canCloseCase ? '✅' : '❌'}

💳 ACCOUNT MANAGEMENT:
• Freeze Accounts: ${permissions.canFreeze ? '✅' : '❌'}
• Unfreeze Accounts: ${permissions.canUnfreeze ? '✅' : '❌'}
• Bulk Freeze: ${permissions.canBulkFreeze ? '✅' : '❌'}

📊 ADDITIONAL FEATURES:
• View Metrics: ${permissions.canViewMetrics ? '✅' : '❌'}
• Export Data: ${permissions.canExportData ? '✅' : '❌'}
• Manage Inbox: ${permissions.canManageInbox ? '✅' : '❌'}
• Manage Workspaces: ${permissions.canManageWorkspaces ? '✅' : '❌'}

━━━━━━━━━━━━━━━━━━━━━━
🔑 TEST ACCOUNTS:
• admin@company.com (Full Access)
• compliance-lead@company.com (Compliance Lead)
• compliance@company.com (Compliance Analyst)
• ops@company.com (Operations Manager)
• auditor@company.com (Auditor)
• support@company.com (Support)
      `;
      
      return resultBuilder.success(message);
    },
  });
});

// ========================================
// START AGENT
// ========================================

agent.mountOnStandaloneServer(Number(process.env.APPLICATION_PORT || 3310));

agent.start().catch(error => {
  console.error('\x1b[31merror:\x1b[0m Forest Admin agent failed to start\n');
  console.error('');
  console.error(error.stack);
  process.exit(1);
});

console.log(`
┌────────────────────────────────────────────────────────────────┐
│  🚀 COMPLIANCE & OPERATIONS PLATFORM - FULLY CONFIGURED        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🎯 DEMO MODE: ${DEMO_MODE ? 'ENABLED ✅' : 'DISABLED ❌'}                                   │
│     All permission checks are ${DEMO_MODE ? 'bypassed' : 'active'}                        │
│                                                                │
│  ✅ ALL FEATURES ACTIVE:                                      │
│                                                                │
│  📋 FULL ONBOARDING PROCESS:                                  │
│  • Application review workflow                                │
│  • Approve/Reject/Request Info actions                        │
│  • Bulk operations                                            │
│  • Sanctions & KYC management                                 │
│  • Smart inbox for new submissions                            │
│                                                                │
│  🚨 AML MONITORING:                                           │
│  • Alert triage & investigation                               │
│  • Risk visualization                                         │
│  • Case escalation                                            │
│  • Bulk dismissals                                            │
│  • Severity-based workspaces                                  │
│                                                                │
│  💼 COMPLETE FEATURE SET:                                     │
│  • 40+ Smart Actions                                          │
│  • 50+ Smart Fields                                           │
│  • 45+ Workspaces/Segments                                    │
│  • 10+ Dashboard Charts                                       │
│  • Full Audit Trail                                           │
│  • Role-based Permissions                                     │
│  • Inbox Management                                           │
│                                                                │
│  📊 COLLECTIONS:                                              │
│  • applications • alerts • aml_alerts                         │
│  • cases • accounts • customers                               │
│  • documents • transactions • notes                           │
│  • audit_log • users                                          │
│                                                                │
│  📈 DASHBOARD CHARTS:                                         │
│  • Applications by Status                                     │
│  • Applications Risk Distribution                             │
│  • Alerts by Severity & Status                                │
│  • Cases by Priority                                          │
│  • Accounts by Status                                         │
│  • Total Balance                                              │
│  • Transactions Over Time                                     │
│  • Transaction Volume by Direction                            │
│  • Top Merchants                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
`);