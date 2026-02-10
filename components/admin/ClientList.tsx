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
            className="border-2 border-black bg-white p-6 animate-pulse"
            style={{ boxShadow: '4px 4px 0 0 #000' }}
          >
            <div className="h-6 bg-gray-200 w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#FF2E63]" />
          <p
            className="text-sm text-black/60"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search clients..."
            className="w-full border-2 border-black bg-white pl-10 pr-4 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="border-2 border-black bg-[#FF2E63] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <Plus className="w-4 h-4" />
          NEW CLIENT
        </button>
      </div>

      {/* Client Grid */}
      {paginatedClients.length === 0 ? (
        <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <div className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p
              className="text-sm text-black/60"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {searchQuery ? 'NO CLIENTS MATCH YOUR SEARCH' : 'NO CLIENTS FOUND'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedClients.map((client, index) => (
            <motion.div
              key={client.id}
              className="border-2 border-black bg-white p-6 group"
              style={{ boxShadow: '4px 4px 0 0 #000' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 border-2 border-black bg-black">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 border-2 border-black bg-[#F5F5F0]">
                    <FolderKanban className="w-4 h-4" />
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {client._count?.projects || 0}
                    </span>
                  </div>
                  <button
                    onClick={() => onEdit(client)}
                    className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {client.name}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-black/40" />
                  <a
                    href={`mailto:${client.email}`}
                    className="text-black/60 truncate hover:text-[#FF2E63] transition-colors"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {client.email}
                  </a>
                </div>

                {client.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-black/40" />
                    <span
                      className="text-black/60"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {client.company}
                    </span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-black/40">📞</span>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-black/60 hover:text-[#FF2E63] transition-colors"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {client.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-black/10">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs text-black/40"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    INVOICES
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {client._count?.invoices || 0}
                  </span>
                </div>
              </div>

              {/* Click to edit hint */}
              <p
                className="text-xs text-black/40 mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Click card to edit
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-2 border-black bg-white p-4 flex items-center justify-between" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <span
            className="text-xs text-black/60"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            SHOWING {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredClients.length)} OF{' '}
            {filteredClients.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              className="px-4 py-2 border-2 border-black bg-white text-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
