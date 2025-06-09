# Tokenized Non-Profit Grant Management System

A comprehensive blockchain-based grant management system built with Clarity smart contracts for the Stacks blockchain. This system provides end-to-end management of non-profit grants, from funder verification to impact reporting.

## 🎯 Overview

The Tokenized Non-Profit Grant Management System consists of five interconnected smart contracts that handle the complete grant lifecycle:

1. **Funder Verification Contract** - Validates and manages authorized grant funding organizations
2. **Application Processing Contract** - Processes and manages grant applications
3. **Fund Distribution Contract** - Distributes grant funds based on milestones
4. **Progress Monitoring Contract** - Tracks project progress and milestones
5. **Impact Reporting Contract** - Records and validates project outcomes and impact

## 🏗️ Architecture

### Contract Structure

\`\`\`
contracts/
├── funder-verification.clar     # Funder validation and authorization
├── application-processing.clar  # Grant application management
├── fund-distribution.clar       # Fund allocation and distribution
├── progress-monitoring.clar     # Project progress tracking
└── impact-reporting.clar        # Impact measurement and reporting
\`\`\`

### Key Features

- **Decentralized Verification**: Transparent funder verification process
- **Automated Fund Distribution**: Milestone-based fund release
- **Progress Tracking**: Real-time project monitoring
- **Impact Measurement**: Comprehensive outcome reporting
- **Transparency**: All transactions recorded on blockchain

## 🚀 Getting Started

### Prerequisites

- Stacks CLI
- Clarinet (for local development)
- Node.js (for testing)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd tokenized-grant-management
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

## 📋 Contract Functions

### Funder Verification Contract

- \`apply-for-verification\` - Submit funder verification application
- \`verify-funder\` - Approve funder verification (admin only)
- \`is-verified-funder\` - Check if funder is verified
- \`get-funder-info\` - Get funder details

### Application Processing Contract

- \`submit-application\` - Submit grant application
- \`review-application\` - Review and update application status
- \`get-application\` - Retrieve application details
- \`get-application-status\` - Check application status

### Fund Distribution Contract

- \`deposit-funds\` - Deposit funds for grants
- \`create-grant-fund\` - Create grant fund allocation
- \`distribute-milestone-payment\` - Release milestone payments
- \`get-grant-fund\` - Get grant fund details

### Progress Monitoring Contract

- \`initialize-project-monitoring\` - Set up project tracking
- \`submit-progress-report\` - Submit progress updates
- \`complete-milestone\` - Mark milestone as completed
- \`get-grant-progress\` - Get project progress

### Impact Reporting Contract

- \`submit-impact-report\` - Submit final impact report
- \`add-impact-metric\` - Add measurable impact metrics
- \`verify-impact-report\` - Verify impact claims
- \`finalize-grant-outcomes\` - Finalize project outcomes

## 🔄 Grant Lifecycle

1. **Funder Registration**: Organizations apply and get verified as funders
2. **Application Submission**: Non-profits submit grant applications
3. **Application Review**: Funders review and approve applications
4. **Fund Allocation**: Approved grants receive fund allocation
5. **Progress Monitoring**: Regular progress reports and milestone tracking
6. **Fund Distribution**: Milestone-based fund releases
7. **Impact Reporting**: Final impact assessment and verification

## 🧪 Testing

The system includes comprehensive tests using Vitest:

\`\`\`bash
npm test
\`\`\`

Test files cover:
- Contract deployment and initialization
- Funder verification workflows
- Application processing
- Fund distribution mechanisms
- Progress monitoring
- Impact reporting

## 🔒 Security Features

- **Access Control**: Role-based permissions for different functions
- **Validation**: Input validation and error handling
- **Transparency**: All actions recorded on blockchain
- **Immutability**: Contract state changes are permanent and auditable

## 📊 Data Structures

### Funder Data
- Verification status and date
- Total grants funded
- Active status

### Application Data
- Applicant and funder information
- Grant details and requirements
- Review status and timeline

### Grant Fund Data
- Fund allocation and distribution schedule
- Milestone tracking
- Payment history

### Progress Data
- Milestone completion
- Progress reports
- Timeline tracking

### Impact Data
- Beneficiaries reached
- Outcomes achieved
- Success metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Integration with external verification services
- Advanced analytics and reporting
- Mobile application interface
- Multi-signature fund release
- Automated compliance checking

