import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  Linking,
} from 'react-native';
import {
  Plus,
  Search,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  LogOut,
  User,
  ScanLine,
  Download,
  Bot,
  UserPlus,
  ArrowUpDown,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { Contact } from '../types';
import { exportToExcel, exportToCSV, exportToVCard } from '../services/exportService';

interface DashboardScreenProps {
  contacts: Contact[];
  onScanClick: () => void;
  onDeleteContact: (id: string) => void;
  onLogout: () => void;
  onAIAssistant: () => void;
}

const getAvatarColor = (name: string) => {
  const colors = [
    { bg: '#DBEAFE', text: '#1E40AF' },
    { bg: '#E0E7FF', text: '#3730A3' },
    { bg: '#E9D5FF', text: '#6B21A8' },
    { bg: '#FCE7F3', text: '#9F1239' },
    { bg: '#FEE2E2', text: '#991B1B' },
    { bg: '#FFEDD5', text: '#9A3412' },
    { bg: '#D1FAE5', text: '#065F46' },
    { bg: '#CFFAFE', text: '#155E75' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

type SortOption = 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc' | 'date-newest' | 'date-oldest';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  contacts,
  onScanClick,
  onDeleteContact,
  onLogout,
  onAIAssistant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const handleExport = () => {
    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'You have no contacts to export.');
      return;
    }

    Alert.alert(
      'Export Contacts',
      'Choose export format',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CSV',
          onPress: async () => {
            try {
              await exportToCSV(contacts);
            } catch (error) {
              Alert.alert('Error', 'Failed to export contacts');
            }
          },
        },
        {
          text: 'Excel',
          onPress: async () => {
            try {
              await exportToExcel(contacts);
            } catch (error) {
              Alert.alert('Error', 'Failed to export contacts');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  const handleAddToContacts = async (contact: Contact) => {
    try {
      await exportToVCard(contact);
    } catch (error) {
      Alert.alert('Error', 'Failed to export contact');
    }
  };

  // Get unique companies for filter
  const uniqueCompanies = Array.from(
    new Set(contacts.map((c) => c.company).filter((c) => c && c.trim() !== ''))
  ).sort();

  // Toggle company filter
  const toggleCompanyFilter = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCompanies([]);
    setSearchTerm('');
  };

  // Get sort label
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'name-asc': return 'Name (A-Z)';
      case 'name-desc': return 'Name (Z-A)';
      case 'company-asc': return 'Company (A-Z)';
      case 'company-desc': return 'Company (Z-A)';
      case 'date-newest': return 'Newest First';
      case 'date-oldest': return 'Oldest First';
    }
  };

  // Filter contacts
  let filteredContacts = contacts.filter((c) => {
    const term = searchTerm.toLowerCase();

    // Search filter
    const matchesSearch =
      !term ||
      (c.fullName || '').toLowerCase().includes(term) ||
      (c.company || '').toLowerCase().includes(term) ||
      (c.jobTitle || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term);

    // Company filter
    const matchesCompany =
      selectedCompanies.length === 0 ||
      (c.company && selectedCompanies.includes(c.company));

    return matchesSearch && matchesCompany;
  });

  // Sort contacts
  filteredContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.fullName || '').localeCompare(b.fullName || '');
      case 'name-desc':
        return (b.fullName || '').localeCompare(a.fullName || '');
      case 'company-asc':
        return (a.company || '').localeCompare(b.company || '');
      case 'company-desc':
        return (b.company || '').localeCompare(a.company || '');
      case 'date-newest':
        return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
      case 'date-oldest':
        return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
      default:
        return 0;
    }
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteContact(id),
        },
      ]
    );
  };

  const handleLogoutPress = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isExpanded = expandedContact === item.id;
    const avatarColor = getAvatarColor(item.fullName);

    return (
      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => setExpandedContact(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.contactHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: avatarColor.bg },
            ]}
          >
            <Text style={[styles.avatarText, { color: avatarColor.text }]}>
              {getInitials(item.fullName)}
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.fullName}</Text>
            {item.company && (
              <Text style={styles.contactCompany}>{item.company}</Text>
            )}
            {item.jobTitle && (
              <Text style={styles.contactTitle}>{item.jobTitle}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.fullName)}
            style={styles.deleteButton}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.contactDetails}>
            {item.phone && (
              <TouchableOpacity
                style={styles.detailRow}
                onPress={() => handleCall(item.phone)}
              >
                <Phone size={16} color="#10B981" />
                <Text style={[styles.detailText, styles.linkText]}>{item.phone}</Text>
              </TouchableOpacity>
            )}
            {item.email && (
              <TouchableOpacity
                style={styles.detailRow}
                onPress={() => handleEmail(item.email)}
              >
                <Mail size={16} color="#4F46E5" />
                <Text style={[styles.detailText, styles.linkText]}>{item.email}</Text>
              </TouchableOpacity>
            )}
            {item.website && (
              <View style={styles.detailRow}>
                <Globe size={16} color="#64748B" />
                <Text style={styles.detailText}>{item.website}</Text>
              </View>
            )}
            {item.address && (
              <View style={styles.detailRow}>
                <MapPin size={16} color="#64748B" />
                <Text style={styles.detailText}>{item.address}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.addToContactsButton}
              onPress={() => handleAddToContacts(item)}
            >
              <UserPlus size={16} color="#FFF" />
              <Text style={styles.addToContactsText}>Add to Phone Contacts</Text>
            </TouchableOpacity>

            {item.frontImage && (
              <Image
                source={{ uri: item.frontImage }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Contacts</Text>
          <Text style={styles.headerSubtitle}>
            {contacts.length} saved contact{contacts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
            <Download size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogoutPress} style={styles.headerButton}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#94A3B8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm !== '' && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort and Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.filterLeft}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
          >
            <ArrowUpDown size={16} color="#4F46E5" />
            <Text style={styles.filterButtonText}>{getSortLabel(sortBy)}</Text>
            <ChevronDown size={16} color="#4F46E5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCompanies.length > 0 && styles.filterButtonActive
            ]}
            onPress={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
          >
            <Filter size={16} color={selectedCompanies.length > 0 ? '#FFF' : '#4F46E5'} />
            <Text style={[
              styles.filterButtonText,
              selectedCompanies.length > 0 && styles.filterButtonTextActive
            ]}>
              Filter{selectedCompanies.length > 0 ? ` (${selectedCompanies.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {(selectedCompanies.length > 0 || searchTerm) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.dropdownMenu}>
          {(['name-asc', 'name-desc', 'company-asc', 'company-desc', 'date-newest', 'date-oldest'] as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                sortBy === option && styles.dropdownItemActive
              ]}
              onPress={() => {
                setSortBy(option);
                setShowSortMenu(false);
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                sortBy === option && styles.dropdownItemTextActive
              ]}>
                {getSortLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={styles.dropdownMenu}>
          <Text style={styles.filterMenuTitle}>Filter by Company</Text>
          {uniqueCompanies.length === 0 ? (
            <Text style={styles.noCompaniesText}>No companies to filter</Text>
          ) : (
            uniqueCompanies.map((company) => (
              <TouchableOpacity
                key={company}
                style={styles.checkboxItem}
                onPress={() => toggleCompanyFilter(company)}
              >
                <View style={[
                  styles.checkbox,
                  selectedCompanies.includes(company) && styles.checkboxChecked
                ]}>
                  {selectedCompanies.includes(company) && (
                    <View style={styles.checkboxInner} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{company}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TouchableOpacity
            style={styles.bigScanButton}
            onPress={onScanClick}
            activeOpacity={0.8}
          >
            <ScanLine size={64} color="#FFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.emptyTitle}>
            {searchTerm ? 'No contacts found' : 'No contacts yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchTerm
              ? 'Try a different search term'
              : 'Tap the scan button to capture your first card'}
          </Text>
        </View>
      ) : (
        <View style={styles.contactsWrapper}>
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          {/* Middle Scan Button for when there are contacts */}
          <View style={styles.middleScanContainer}>
            <TouchableOpacity
              style={styles.middleScanButton}
              onPress={onScanClick}
              activeOpacity={0.8}
            >
              <ScanLine size={32} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.middleScanText}>Scan Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AI Chatbot Button */}
      <TouchableOpacity style={styles.scanButton} onPress={onAIAssistant}>
        <Bot size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  dropdownMenu: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#475569',
  },
  dropdownItemTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  filterMenuTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  noCompaniesText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingVertical: 16,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  contactCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  contactTitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
  },
  contactDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  linkText: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  addToContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  addToContactsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  contactsWrapper: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  bigScanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  middleScanContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  middleScanButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  middleScanText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
