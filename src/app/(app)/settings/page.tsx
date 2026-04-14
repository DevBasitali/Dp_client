"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, MessageCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [ownerNumber, setOwnerNumber] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api
      .get("/settings/whatsapp")
      .then(({ data }) => {
        setPhoneNumberId(data.data.phoneNumberId || "");
        setAccessToken(data.data.accessToken || "");
        setOwnerNumber(data.data.ownerWhatsappNumber || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Don't overwrite the masked token if user hasn't changed it
      const payload: Record<string, string> = {
        phoneNumberId,
        ownerWhatsappNumber: ownerNumber,
      };
      if (!accessToken.startsWith("***")) {
        payload.accessToken = accessToken;
      }
      await api.put("/settings/whatsapp", payload);
      toast.success("WhatsApp settings saved.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save settings.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await api.post("/settings/whatsapp/test", {});
      toast.success("Test message sent successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Connection failed. Check your credentials.";
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 lg:p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center">
          <Settings className="mr-2 text-[#F0A500]" />
          WhatsApp Configuration
        </h1>
        <p className="text-gray-500 text-sm">
          Manage WhatsApp integration settings.
        </p>
      </div>

      <Card className="shadow-sm border-0 max-w-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-600" />
            WhatsApp Business API (Meta)
          </CardTitle>
          <CardDescription>
            Configure Meta WhatsApp Business API to send vendor order
            notifications automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Phone Number ID</Label>
                <Input
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="From Meta Developer Dashboard"
                />
                <p className="text-xs text-gray-400">
                  Found in WhatsApp → Getting Started
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Access Token</Label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Permanent access token from Meta"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Owner WhatsApp Number</Label>
                <Input
                  value={ownerNumber}
                  onChange={(e) => setOwnerNumber(e.target.value)}
                  placeholder="923001234567 (without + sign)"
                />
                <p className="text-xs text-gray-400">
                  This number receives a copy of all orders
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={testing || saving}
                  className="flex-1"
                >
                  {testing && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Test Connection
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || testing}
                  className="flex-1 bg-[#1B2A4A] hover:bg-[#243660] text-white"
                >
                  {saving && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Settings
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
