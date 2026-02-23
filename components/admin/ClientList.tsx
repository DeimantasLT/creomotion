'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Mail,
  AlertCircle,
  Plus,
  Search,
  Pencil,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Client } from '@/types';

interface ClientWithCounts extends Client {
  _count?: {
    projects: number;
    invoices: number;
  };
}

interface ClientListProps {
  clients: ClientWithCounts[];
  loading: boolean;
  error: string | null;
  onEdit: (client: ClientWithCounts) => void;
  onCreate: () => void;
  pageSize?: number;
}

export default function ClientList({
  clients,
  loading,
  error,
  onEdit,
  onCreate,
  pageSize = 12,
}: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter clients
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;

    const query = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-white/10 bg-[#141414] p-6 animate-pulse rounded-lg"
          >
            <div className="h-6 bg-white/5 rounded w-3/4 mb-4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#ff006e]" />
          <p className="text-sm text-white/60 font-[var(--font-jetbrains-mono)]">
            [ERROR: {error}]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search clients..."
            className="w-full bg-[#1a1a1a] border border-white/10 text-white pl-10 pr-4 py-2 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/30 rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="w-full sm:w-auto bg-[#ff006e] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-[#ff006e]/80 transition-colors rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          NEW CLIENT
        </button>
      </div>

      {/* Client Grid */}
      {paginatedClients.length === 0 ? (
        <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-sm text-white/60 font-[var(--font-jetbrains-mono)]">
              {searchQuery ? 'NO CLIENTS MATCH YOUR SEARCH' : 'NO CLIENTS FOUND'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedClients.map((client, index) => (
            <motion.div
              key={client.id}
              onClick={() => onEdit(client)}
              className="border border-white/10 bg-[#141414] p-4 sm:p-6 group rounded-lg hover:border-white/20 transition-colors cursor-pointer min-h-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onEdit(client)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 border border-white/10 bg-[#0a0a0a] rounded min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 border border-white/10 bg-[#1a1a1a] rounded text-white/80 min-h-[32px]">
                    <FolderKanban className="w-4 h-4" />
                    <span className="text-sm font-bold font-[var(--font-jetbrains-mono)]">
                      {client._count?.projects || 0}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(client);
                    }}
                    className="p-2 border border-white/10 hover:bg-white/10 transition-colors rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Edit client"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-[var(--font-space-grotesk)] break-words">
                {client.name}
              </h3>

              <div className="space-y-2 overflow-hidden">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <a
                    href={`mailto:${client.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/60 truncate hover:text-[#ff006e] transition-colors font-[var(--font-jetbrains-mono)]"
                  >
                    {client.email}
                  </a>
                </div>

                {client.company && (
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="text-white/60 font-[var(--font-jetbrains-mono)] truncate">
                      {client.company}
                    </span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="text-white/40 flex-shrink-0">📞</span>
                    <a
                      href={`tel:${client.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-white/60 hover:text-[#ff006e] transition-colors font-[var(--font-jetbrains-mono)] truncate"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-[var(--font-jetbrains-mono)]">
                    INVOICES
                  </span>
                  <span className="text-sm font-bold text-white font-[var(--font-jetbrains-mono)]">
                    {client._count?.invoices || 0}
                  </span>
                </div>
              </div>

              {/* Click to edit hint - hidden on mobile, shown on desktop */}
              <p className="text-xs text-white/40 mt-3 text-center hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity font-[var(--font-jetbrains-mono)]">
                Click card to edit
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border border-white/10 bg-[#141414] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg">
          <span className="text-xs text-white/60 font-[var(--font-jetbrains-mono)]">
            SHOWING {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredClients.length)} OF{' '}
            {filteredClients.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 sm:px-4 py-2 border border-white/10 text-white/80 text-sm font-[var(--font-jetbrains-mono)] min-h-[44px] flex items-center justify-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
