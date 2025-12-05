import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Contact } from '../types';

// Export contacts to CSV
export const exportToCSV = async (contacts: Contact[]): Promise<void> => {
  try {
    // Create CSV header
    const headers = ['Name', 'Job Title', 'Company', 'Email', 'Phone', 'Website', 'Address', 'Scanned Date'];

    // Create CSV rows
    const rows = contacts.map(contact => [
      contact.fullName || '',
      contact.jobTitle || '',
      contact.company || '',
      contact.email || '',
      contact.phone || '',
      contact.website || '',
      contact.address || '',
      new Date(contact.scannedAt).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Save to file
    const fileName = `CardSnap_Contacts_${new Date().toISOString().split('T')[0]}.csv`;
    const file = new File(Paths.document, fileName);

    await file.write(csvContent);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Contacts',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export contacts');
  }
};

// Export contacts to Excel-compatible format (CSV with UTF-8 BOM)
export const exportToExcel = async (contacts: Contact[]): Promise<void> => {
  try {
    // Create CSV header
    const headers = ['Name', 'Job Title', 'Company', 'Email', 'Phone', 'Website', 'Address', 'Scanned Date'];

    // Create CSV rows
    const rows = contacts.map(contact => [
      contact.fullName || '',
      contact.jobTitle || '',
      contact.company || '',
      contact.email || '',
      contact.phone || '',
      contact.website || '',
      contact.address || '',
      new Date(contact.scannedAt).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Add UTF-8 BOM for Excel compatibility
    const bom = '\uFEFF';
    const contentWithBom = bom + csvContent;

    // Save to file
    const fileName = `CardSnap_Contacts_${new Date().toISOString().split('T')[0]}.csv`;
    const file = new File(Paths.document, fileName);

    await file.write(contentWithBom);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export to Excel',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export to Excel');
  }
};

// Export single contact as VCard
export const exportToVCard = async (contact: Contact): Promise<void> => {
  try {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.fullName || ''}`,
      contact.company ? `ORG:${contact.company}` : '',
      contact.jobTitle ? `TITLE:${contact.jobTitle}` : '',
      contact.email ? `EMAIL:${contact.email}` : '',
      contact.phone ? `TEL:${contact.phone}` : '',
      contact.website ? `URL:${contact.website}` : '',
      contact.address ? `ADR:;;${contact.address}` : '',
      'END:VCARD'
    ].filter(line => line).join('\n');

    const fileName = `${contact.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
    const file = new File(Paths.document, fileName);

    await file.write(vcard);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/vcard',
        dialogTitle: 'Save Contact',
        UTI: 'public.vcard',
      });
    }
  } catch (error) {
    console.error('VCard export error:', error);
    throw new Error('Failed to export contact');
  }
};
