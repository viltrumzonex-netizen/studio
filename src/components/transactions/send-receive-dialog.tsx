"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { walletCoins } from "@/lib/mock-data";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SendReceiveDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  // This is a mock address. In a real app, this would be generated per user/coin.
  const myWalletAddress = `0x${user?.uid.slice(0, 10)}...${user?.uid.slice(-4)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myWalletAddress);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">Send / Receive</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card rounded-lg">
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
          </TabsList>
          <TabsContent value="send" className="mt-4">
            <DialogHeader>
              <DialogTitle>Send Crypto</DialogTitle>
              <DialogDescription>
                Enter the details below. Transactions are final.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input id="recipient" placeholder="0x..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset">Asset</Label>
                <Select>
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Select a coin" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletCoins.map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>
                        {coin.name} ({coin.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.0" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Send
            </Button>
          </TabsContent>
          <TabsContent value="receive" className="mt-4">
            <DialogHeader>
              <DialogTitle>Receive Crypto</DialogTitle>
              <DialogDescription>
                Share your address to receive funds.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-center text-sm text-muted-foreground">Your Wallet Address</p>
                <div className="flex items-center space-x-2 p-3 rounded-md bg-white/10">
                    <p className="text-sm font-mono text-foreground truncate flex-1">{myWalletAddress}</p>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">Only send assets on compatible networks to this address.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
