import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, User } from "lucide-react";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { createClientSchema } from "@shared/types/admin";
import type { CreateClientInput } from "@shared/types/admin";

// Schema para o formulário (reutilizando do shared)
const formSchema = createClientSchema;

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  clientData?: any; // Dados para edição (opcional)
  mode?: "create" | "edit";
}

export default function ClientForm({
  open,
  onClose,
  clientData,
  mode = "create",
}: ClientFormProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const isEditing = mode === "edit" && clientData;

  // Configurar formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
          name: clientData.name || "",
          email: clientData.email || "",
          company_name: clientData.company_name || "",
          phone: clientData.phone || "",
          document: clientData.document || "",
          address: clientData.address || "",
          city: clientData.city || "",
          state: clientData.state || "",
          country: clientData.country || "Brasil",
          zipcode: clientData.zipcode || "",
          timezone: clientData.timezone || "America/Sao_Paulo",
          language: clientData.language || "pt-BR",
          notes: clientData.notes || "",
          avatar_url: clientData.avatar_url || "",
          sendWelcomeEmail: false,
        }
      : {
          name: "",
          email: "",
          company_name: "",
          phone: "",
          document: "",
          address: "",
          city: "",
          state: "",
          country: "Brasil",
          zipcode: "",
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
          notes: "",
          avatar_url: "",
          sendWelcomeEmail: true,
        },
  });

  // Handler de submissão
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing) {
        await updateClient.mutateAsync({
          id: clientData.id,
          ...values,
        });
      } else {
        await createClient.mutateAsync(values);
      }
      form.reset();
      onClose();
    } catch (error) {
      // Erro já tratado pelos hooks
      console.error("Erro ao salvar cliente:", error);
    }
  }

  const isLoading = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cliente abaixo."
              : "Preencha os dados do novo cliente. Um email de boas-vindas será enviado automaticamente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Informações Básicas</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="joao@empresa.com"
                          {...field}
                          disabled={isEditing}
                        />
                      </FormControl>
                      {isEditing && (
                        <FormDescription>
                          Email não pode ser alterado
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Empresa */}
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Empresa XYZ LTDA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Telefone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Documento */}
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Endereço</h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua Exemplo, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="Brasil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Preferências */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Preferências</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (BR)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">
                            São Paulo (UTC-3)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            New York (UTC-5)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            London (UTC+0)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o cliente..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Essas notas são apenas para uso interno e não serão vistas
                    pelo cliente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL do Avatar */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Avatar</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/avatar.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL de uma imagem para o avatar do cliente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enviar Email de Boas-vindas */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="sendWelcomeEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Enviar Email de Boas-vindas</FormLabel>
                      <FormDescription>
                        Enviar automaticamente um email com o link de acesso ao
                        portal
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Atualizar Cliente" : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
