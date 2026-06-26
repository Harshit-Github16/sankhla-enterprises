import React from 'react';
import SolarERPApp from '@/components/SolarERPApp';
import * as dbServices from '@/lib/services';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let companies = await dbServices.getCompanies().catch(() => []);
  let activeCompany = companies[0];

  if (!activeCompany) {
    activeCompany = await dbServices.createCompany({
      name: "Sankhla Enterprises",
      gstNumber: "08AECPS8560R1Z4",
      panNumber: "AECPS8560R",
      bankName: "Punjab National Bank",
      bankAccountNo: "1949102100001183",
      bankIfsc: "PUNB0194910",
      bankBranch: "Jodhpur",
      address: "BHAGVANKABAGH, NEAR OF VIDHYASHALA, CHANDPOLE",
      city: "Jodhpur",
      state: "Rajasthan",
      pincode: "342001"
    }).catch(err => {
      console.error("Failed to seed default company:", err);
      return null;
    });
    if (activeCompany) {
      companies = [activeCompany];
    }
  }

  const companyId = activeCompany ? activeCompany.id : undefined;

  const [
    clients,
    quotations,
    payments,
    overdueRecords,
  ] = await Promise.all([
    companyId ? dbServices.getClients(companyId).catch(() => []) : Promise.resolve([]),
    companyId ? dbServices.getQuotations(companyId).catch(() => []) : Promise.resolve([]),
    companyId ? dbServices.getPayments(companyId).catch(() => []) : Promise.resolve([]),
    companyId ? dbServices.getOverdueRecords(companyId).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <SolarERPApp 
      initialCompanies={companies}
      initialClients={clients}
      initialQuotations={quotations}
      initialPayments={payments}
      initialOverdueRecords={overdueRecords}
    />
  );
}
