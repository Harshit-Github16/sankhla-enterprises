import { prisma } from './db';

// ==========================================
// COMPANIES
// ==========================================
export async function getCompanies() {
  return await prisma.company.findMany();
}

export async function createCompany(companyData) {
  return await prisma.company.create({
    data: companyData
  });
}

// ==========================================
// CLIENTS
// ==========================================
export async function getClients(companyId) {
  return await prisma.client.findMany({
    where: { companyId }
  });
}

export async function createClient(companyId, clientData) {
  // Extract projectPrice safely to store dynamically or handle separately to bypass Prisma Client cache issues
  const { projectPrice, ...clientFields } = clientData;
  return await prisma.client.create({
    data: {
      ...clientFields,
      companyId,
      capacity: parseFloat(clientFields.capacity || 0),
      projectPrice: projectPrice ? parseFloat(projectPrice) : null
    }
  });
}

export async function updateClient(id, clientData) {
  return await prisma.client.update({
    where: { id },
    data: clientData
  });
}

export async function deleteClient(id) {
  return await prisma.client.delete({
    where: { id }
  });
}

// ==========================================
// QUOTATIONS
// ==========================================
export async function getQuotations(companyId) {
  return await prisma.quotation.findMany({
    where: { companyId },
    include: {
      client: true,
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createQuotation(companyId, quoteData) {
  const capacity = parseFloat(quoteData.capacity || 5);
  const panelQuantity = parseInt(quoteData.panelQuantity || 10);
  const panelWattage = parseInt(quoteData.panelWattage || 500);
  
  const materialCost = quoteData.materialCost !== undefined && quoteData.materialCost !== '' ? parseFloat(quoteData.materialCost) : (panelQuantity * 11000 + 150000); 
  const labourCost = quoteData.labourCost !== undefined && quoteData.labourCost !== '' ? parseFloat(quoteData.labourCost) : (capacity * 8000);
  const profit = quoteData.profit !== undefined && quoteData.profit !== '' ? parseFloat(quoteData.profit) : (materialCost * 0.15);
  
  const customItems = Array.isArray(quoteData.items) ? quoteData.items.map(item => ({
    description: item.description || '',
    amount: parseFloat(item.amount || 0),
    quantity: 1,
    rate: parseFloat(item.amount || 0)
  })).filter(i => i.description && i.amount > 0) : [];

  const itemsTotal = customItems.reduce((sum, item) => sum + item.amount, 0);

  const baseTotal = materialCost + labourCost + profit + itemsTotal +
    parseFloat(quoteData.installationCharges || 0) + 
    parseFloat(quoteData.transportationCharges || 0) + 
    parseFloat(quoteData.otherCharges || 0) - 
    parseFloat(quoteData.discount || 0);

  const gstRate = parseFloat(quoteData.gstRate || 18);
  const gstAmount = Math.round(baseTotal * (gstRate / 100));
  const grandTotal = baseTotal + gstAmount;

  const proposalNumber = quoteData.proposalNumber || `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return await prisma.quotation.create({
    data: {
      companyId,
      clientId: quoteData.clientId,
      proposalNumber,
      capacity,
      panelBrand: quoteData.panelBrand || "Waaree Solar",
      panelModel: quoteData.panelModel || "Mono PERC Half Cut",
      panelWattage,
      panelQuantity,
      inverterBrand: quoteData.inverterBrand || "Growatt",
      inverterModel: quoteData.inverterModel || "MAX 50KTL3",
      structure: quoteData.structure || "Hot Dip Galvanized",
      cable: quoteData.cable || "Polycab DC 4 Sqmm",
      mc4: quoteData.mc4 || "Standard MC4",
      acdb: quoteData.acdb || "Standard ACDB Box",
      dcdb: quoteData.dcdb || "Standard DCDB Box",
      installationCharges: parseFloat(quoteData.installationCharges || 0),
      transportationCharges: parseFloat(quoteData.transportationCharges || 0),
      otherCharges: parseFloat(quoteData.otherCharges || 0),
      discount: parseFloat(quoteData.discount || 0),
      gstRate,
      materialCost,
      labourCost,
      profit,
      gstAmount,
      grandTotal,
      status: quoteData.status || "DRAFT",
      dueDate: quoteData.dueDate ? new Date(quoteData.dueDate) : null,
      ...(customItems.length > 0 && { items: { create: customItems } })
    },
    include: {
      items: true,
      client: true
    }
  });
}

export async function updateQuotation(id, quoteData) {
  const capacity = parseFloat(quoteData.capacity || 5);
  const panelQuantity = parseInt(quoteData.panelQuantity || 10);
  const panelWattage = parseInt(quoteData.panelWattage || 500);
  
  const materialCost = quoteData.materialCost !== undefined && quoteData.materialCost !== '' ? parseFloat(quoteData.materialCost) : (panelQuantity * 11000 + 150000); 
  const labourCost = quoteData.labourCost !== undefined && quoteData.labourCost !== '' ? parseFloat(quoteData.labourCost) : (capacity * 8000);
  const profit = quoteData.profit !== undefined && quoteData.profit !== '' ? parseFloat(quoteData.profit) : (materialCost * 0.15);
  
  const customItems = Array.isArray(quoteData.items) ? quoteData.items.map(item => ({
    description: item.description || '',
    amount: parseFloat(item.amount || 0),
    quantity: 1,
    rate: parseFloat(item.amount || 0)
  })).filter(i => i.description && i.amount > 0) : [];

  const itemsTotal = customItems.reduce((sum, item) => sum + item.amount, 0);

  const baseTotal = materialCost + labourCost + profit + itemsTotal +
    parseFloat(quoteData.installationCharges || 0) + 
    parseFloat(quoteData.transportationCharges || 0) + 
    parseFloat(quoteData.otherCharges || 0) - 
    parseFloat(quoteData.discount || 0);

  const gstRate = parseFloat(quoteData.gstRate || 18);
  const gstAmount = Math.round(baseTotal * (gstRate / 100));
  const grandTotal = baseTotal + gstAmount;

  return await prisma.quotation.update({
    where: { id },
    data: {
      ...(quoteData.status && { status: quoteData.status }),
      clientId: quoteData.clientId,
      capacity,
      panelBrand: quoteData.panelBrand || "Waaree Solar",
      panelModel: quoteData.panelModel || "Mono PERC Half Cut",
      panelWattage,
      panelQuantity,
      inverterBrand: quoteData.inverterBrand || "Growatt",
      inverterModel: quoteData.inverterModel || "MAX 50KTL3",
      structure: quoteData.structure || "Hot Dip Galvanized",
      cable: quoteData.cable || "Polycab DC 4 Sqmm",
      mc4: quoteData.mc4 || "Standard MC4",
      acdb: quoteData.acdb || "Standard ACDB Box",
      dcdb: quoteData.dcdb || "Standard DCDB Box",
      installationCharges: parseFloat(quoteData.installationCharges || 0),
      transportationCharges: parseFloat(quoteData.transportationCharges || 0),
      otherCharges: parseFloat(quoteData.otherCharges || 0),
      discount: parseFloat(quoteData.discount || 0),
      gstRate,
      materialCost,
      labourCost,
      profit,
      gstAmount,
      grandTotal,
      dueDate: quoteData.dueDate ? new Date(quoteData.dueDate) : null,
      items: {
        deleteMany: {},
        ...(customItems.length > 0 && { create: customItems })
      }
    },
    include: {
      items: true,
      client: true
    }
  });
}

export async function deleteQuotation(id) {
  return await prisma.quotation.delete({
    where: { id }
  });
}

// ==========================================
// PAYMENTS
// ==========================================
export async function getPayments(companyId) {
  return await prisma.payment.findMany({
    where: { companyId },
    include: {
      client: true
    }
  });
}

export async function createPayment(companyId, paymentData) {
  const count = await prisma.payment.count({ where: { companyId } });
  const receiptNumber = `REC-2026-${String(count + 1).padStart(3, '0')}`;
  
  return await prisma.payment.create({
    data: {
      ...paymentData,
      companyId,
      receiptNumber,
      amount: parseFloat(paymentData.amount)
    }
  });
}

// ==========================================
// OVERDUE RECORDS
// ==========================================
export async function getOverdueRecords(companyId) {
  return await prisma.overdueRecord.findMany({
    where: { companyId }
  });
}

export async function createOverdueRecord(companyId, overdueData) {
  return await prisma.overdueRecord.create({
    data: {
      companyId,
      proposalNumber: overdueData.proposalNumber,
      clientName: overdueData.clientName,
      dueDate: overdueData.dueDate ? new Date(overdueData.dueDate) : null,
      grandTotal: parseFloat(overdueData.grandTotal || 0),
      clientPayments: parseFloat(overdueData.clientPayments || 0),
      unpaidBalance: parseFloat(overdueData.unpaidBalance || 0)
    }
  });
}

export async function updateOverdueRecord(id, overdueData) {
  return await prisma.overdueRecord.update({
    where: { id },
    data: {
      proposalNumber: overdueData.proposalNumber,
      clientName: overdueData.clientName,
      dueDate: overdueData.dueDate ? new Date(overdueData.dueDate) : null,
      grandTotal: parseFloat(overdueData.grandTotal || 0),
      clientPayments: parseFloat(overdueData.clientPayments || 0),
      unpaidBalance: parseFloat(overdueData.unpaidBalance || 0)
    }
  });
}

export async function deleteOverdueRecord(id) {
  return await prisma.overdueRecord.delete({
    where: { id }
  });
}
