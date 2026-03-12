import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Smartphone, RefreshCw, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface TokenData {
  id: string;
  token: string;
  label: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface DeviceData {
  id: string;
  token: string;
  device_fingerprint: string;
  device_label: string | null;
  user_agent: string | null;
  last_seen_at: string | null;
  created_at: string | null;
}

function getStatusInfo(token: TokenData) {
  if (!token.is_active) return { label: "Nonaktif", variant: "destructive" as const, icon: XCircle };
  if (!token.expires_at) return { label: "Belum digunakan", variant: "secondary" as const, icon: Clock };
  const now = new Date();
  const exp = new Date(token.expires_at);
  const days = differenceInDays(exp, now);
  if (days <= 0) return { label: "Kadaluarsa", variant: "destructive" as const, icon: XCircle };
  if (days <= 14) return { label: `${days} hari lagi`, variant: "outline" as const, icon: AlertTriangle };
  return { label: "Aktif", variant: "default" as const, icon: CheckCircle };
}

function getRemainingTime(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const now = new Date();
  const exp = new Date(expiresAt);
  const days = differenceInDays(exp, now);
  if (days <= 0) return "Sudah kadaluarsa";
  if (days > 30) {
    const months = Math.floor(days / 30);
    const remainDays = days % 30;
    return `${months} bulan ${remainDays} hari`;
  }
  return `${days} hari`;
}

const TokenManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [showDevices, setShowDevices] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [extending, setExtending] = useState<string | null>(null);

  const fetchTokens = async () => {
    const { data } = await supabase
      .from("access_tokens")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setTokens(data as TokenData[]);
    setLoading(false);
  };

  const fetchDevices = async (token: string) => {
    const { data } = await supabase
      .from("token_devices")
      .select("*")
      .eq("token", token)
      .order("last_seen_at", { ascending: false });
    if (data) setDevices(data as DeviceData[]);
  };

  useEffect(() => { fetchTokens(); }, []);

  const handleViewDevices = async (token: string) => {
    setSelectedToken(token);
    setShowDevices(true);
    await fetchDevices(token);
  };

  const handleResetDevices = async (token: string) => {
    setResetting(true);
    const { error } = await supabase
      .from("token_devices")
      .delete()
      .eq("token", token);
    if (error) {
      toast({ title: "Gagal", description: "Gagal mereset perangkat.", variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Semua perangkat telah direset." });
      setDevices([]);
      await fetchTokens();
    }
    setResetting(false);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    const { error } = await supabase.from("token_devices").delete().eq("id", deviceId);
    if (!error) {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      toast({ title: "Berhasil", description: "Perangkat dihapus." });
    }
  };

  const handleExtendToken = async (token: TokenData) => {
    setExtending(token.token);
    const baseDate = token.expires_at ? new Date(token.expires_at) : new Date();
    // If expired, extend from now; otherwise extend from current expiry
    const fromDate = baseDate < new Date() ? new Date() : baseDate;
    fromDate.setMonth(fromDate.getMonth() + 6);
    
    const { error } = await supabase
      .from("access_tokens")
      .update({ expires_at: fromDate.toISOString(), is_active: true } as any)
      .eq("id", token.id);
    
    if (error) {
      toast({ title: "Gagal", description: "Gagal memperpanjang token.", variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: `Token ${token.token} diperpanjang 6 bulan hingga ${format(fromDate, "dd MMM yyyy", { locale: idLocale })}.` });
      await fetchTokens();
    }
    setExtending(null);
  };

  const handleToggleActive = async (token: TokenData) => {
    const newStatus = !token.is_active;
    const { error } = await supabase
      .from("access_tokens")
      .update({ is_active: newStatus } as any)
      .eq("id", token.id);
    if (error) {
      toast({ title: "Gagal", description: "Gagal mengubah status token.", variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: `Token ${token.token} ${newStatus ? "diaktifkan" : "dinonaktifkan"}.` });
      await fetchTokens();
    }
  };

  const stats = {
    total: tokens.length,
    active: tokens.filter(t => t.is_active && (!t.expires_at || new Date(t.expires_at) > new Date())).length,
    used: tokens.filter(t => t.last_used_at).length,
    expiringSoon: tokens.filter(t => {
      if (!t.expires_at) return false;
      const days = differenceInDays(new Date(t.expires_at), new Date());
      return days > 0 && days <= 14;
    }).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-bold text-foreground font-display">Manajemen Token</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Token", value: stats.total, icon: Key, color: "text-primary" },
            { label: "Aktif", value: stats.active, icon: CheckCircle, color: "text-success" },
            { label: "Sudah Dipakai", value: stats.used, icon: Shield, color: "text-accent" },
            { label: "Segera Expired", value: stats.expiringSoon, icon: AlertTriangle, color: "text-warning" },
          ].map(s => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Token List */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Daftar Token Akses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Memuat...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Token</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sisa Waktu</TableHead>
                      <TableHead>Terakhir Dipakai</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map(token => {
                      const status = getStatusInfo(token);
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={token.id}>
                          <TableCell className="font-mono text-xs text-foreground">{token.token}</TableCell>
                          <TableCell className="text-foreground">{token.label || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {getRemainingTime(token.expires_at)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {token.last_used_at
                              ? format(new Date(token.last_used_at), "dd MMM yyyy HH:mm", { locale: idLocale })
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                disabled={extending === token.token}
                                onClick={() => handleExtendToken(token)}
                              >
                                <RotateCcw className={`h-3 w-3 ${extending === token.token ? "animate-spin" : ""}`} />
                                +6 Bulan
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => handleViewDevices(token.token)}
                              >
                                <Smartphone className="h-3 w-3" />
                                Perangkat
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Device Dialog */}
      <Dialog open={showDevices} onOpenChange={setShowDevices}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Smartphone className="h-5 w-5 text-primary" />
              Perangkat Terdaftar
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Token: <span className="font-mono text-xs">{selectedToken}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {devices.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Belum ada perangkat terdaftar.</p>
            ) : (
              devices.map(device => (
                <div key={device.id} className="p-3 rounded-lg bg-muted/50 border border-border flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{device.device_label || "Perangkat"}</p>
                    <p className="text-xs text-muted-foreground truncate">{device.user_agent?.slice(0, 60) || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Terakhir aktif: {device.last_seen_at ? format(new Date(device.last_seen_at), "dd MMM yyyy HH:mm", { locale: idLocale }) : "—"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveDevice(device.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={resetting || devices.length === 0}
              onClick={() => selectedToken && handleResetDevices(selectedToken)}
            >
              <RefreshCw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
              Reset Semua Perangkat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenManagement;
