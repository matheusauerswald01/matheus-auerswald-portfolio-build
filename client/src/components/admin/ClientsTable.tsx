import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  UserX,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useClientsList } from "@/hooks/useClients";
import { format } from "date-fns";
import type { ClientListParams } from "@shared/types/admin";

interface ClientsTableProps {
  onViewClient?: (clientId: string) => void;
  onEditClient?: (clientId: string) => void;
  onDeleteClient?: (clientId: string) => void;
}

export default function ClientsTable({
  onViewClient,
  onEditClient,
  onDeleteClient,
}: ClientsTableProps) {
  // Estados de filtros e paginação
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Buscar clientes
  const params: ClientListParams = {
    page,
    limit,
    search: search || undefined,
    is_active: isActive,
  };

  const { data, isLoading, error } = useClientsList(params);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Resetar para primeira página ao buscar
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      setIsActive(undefined);
    } else {
      setIsActive(value === "active");
    }
    setPage(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Erro ao carregar clientes</p>
            <p className="text-sm text-muted-foreground">
              {error.message || "Tente novamente mais tarde"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Clientes</CardTitle>
          <Badge variant="secondary">
            {data?.pagination.total || 0} clientes
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtro de Status */}
          <Select
            value={
              isActive === undefined ? "all" : isActive ? "active" : "inactive"
            }
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>

          {/* Items por página */}
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="25">25 por página</SelectItem>
              <SelectItem value="50">50 por página</SelectItem>
              <SelectItem value="100">100 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <ClientsTableSkeleton />
        ) : data && data.data.length > 0 ? (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Projetos</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      {/* Cliente */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={client.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Empresa */}
                      <TableCell>
                        <p className="text-sm">{client.company_name || "-"}</p>
                      </TableCell>

                      {/* Projetos */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {client.total_projects || 0}
                          </Badge>
                          {(client.active_projects || 0) > 0 && (
                            <Badge variant="default" className="bg-green-500">
                              {client.active_projects} ativos
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Faturamento */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              minimumFractionDigits: 0,
                            }).format(client.total_billed || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pago:{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              minimumFractionDigits: 0,
                            }).format(client.total_paid || 0)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={client.is_active ? "default" : "secondary"}
                          className={
                            client.is_active
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }
                        >
                          {client.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>

                      {/* Data de Cadastro */}
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {client.created_at
                            ? format(new Date(client.created_at), "dd/MM/yyyy")
                            : "-"}
                        </p>
                      </TableCell>

                      {/* Ações */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onViewClient?.(client.id!)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEditClient?.(client.id!)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Reenviar Convite
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteClient?.(client.id!)}
                              className="text-destructive focus:text-destructive"
                            >
                              {client.is_active ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Deletar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, data.pagination.total)} de{" "}
                {data.pagination.total} clientes
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: data.pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === data.pagination.totalPages ||
                        Math.abs(p - page) <= 1
                    )
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className="w-9"
                        >
                          {p}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            {search && (
              <Button
                variant="link"
                onClick={() => setSearch("")}
                className="mt-2"
              >
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton da tabela
 */
function ClientsTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Projetos</TableHead>
            <TableHead>Faturamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

