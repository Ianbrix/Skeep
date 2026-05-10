import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Globe,
  Mail,
  Monitor,
  Smartphone,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";

const FEATURES = [
  {
    label: "Transaction Recording",
    desc: "Income, expenses, cash advance, reimbursement",
  },
  {
    label: "Budget Management",
    desc: "Annual setup, allocation, real-time tracking",
  },
  {
    label: "COA Report Generation",
    desc: "QSRP, RAAF, ASRP and all official formats",
  },
  {
    label: "Chairperson Monitoring",
    desc: "Transparency dashboard for oversight",
  },
  {
    label: "BIR & Supplier Tracking",
    desc: "TIN, VAT, withholding tax management",
  },
  {
    label: "Receipt Storage",
    desc: "Cloud-backed document and receipt management",
  },
  {
    label: "Subscription System",
    desc: "\u20b199/month with 3-day free trial",
  },
  {
    label: "Offline Mode Support",
    desc: "Work without internet, auto-sync when online",
  },
];

const PLATFORMS = [
  { Icon: Smartphone, label: "Android" },
  { Icon: Smartphone, label: "iOS" },
  { Icon: Monitor, label: "Web (Laptop/Desktop)" },
  { Icon: Globe, label: "Tablets" },
];

const FEATURE_CHIPS = [
  "Transaction Recording",
  "Budget Management",
  "COA Report Generation",
  "Chairperson Monitoring",
  "BIR & Supplier Tracking",
  "Receipt Storage",
  "Subscription System",
  "Offline Mode Support",
];

export function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6" data-ocid="about.page">
        {/* Back nav */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 text-muted-foreground hover:text-foreground"
            data-ocid="about.back.button"
          >
            <Link to="/settings">
              <ArrowLeft size={14} className="mr-1.5" />
              Back to Settings
            </Link>
          </Button>
        </div>

        {/* App Identity */}
        <Card className="border-border overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg flex-shrink-0">
                <span className="text-primary-foreground font-bold text-2xl font-display tracking-tight">
                  SK
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  SKeep
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  SK Financial Management Solution
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">v1.0.0</Badge>
                  <Badge variant="secondary">May 2026</Badge>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
                    <CheckCircle2 size={10} className="mr-1" />
                    COA-Compliant
                  </Badge>
                  <Badge className="bg-muted text-muted-foreground border border-border hover:bg-muted">
                    <WifiOff size={10} className="mr-1" />
                    Offline-Ready
                  </Badge>
                </div>
              </div>
            </div>
            <Separator className="my-5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              A digital financial management system designed for SK Treasurers
              and SK Chairpersons to simplify transaction recording, budgeting,
              reporting, COA compliance, and financial transparency. Built to
              modernize SK financial management, improve accountability, and
              reduce manual encoding of financial records.
            </p>
          </CardContent>
        </Card>

        {/* Feature chips */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 size={15} className="text-primary" />
              Features Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {FEATURE_CHIPS.map((feat) => (
                <Badge
                  key={feat}
                  variant="secondary"
                  className="text-xs py-1 px-2.5"
                  data-ocid={`about.feature.${feat.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                >
                  <CheckCircle2 size={10} className="mr-1.5 text-primary" />
                  {feat}
                </Badge>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feat) => (
                <div key={feat.label} className="flex items-start gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {feat.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* App Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen size={15} className="text-primary" />
                Application Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "App Name", value: "SKeep" },
                { label: "Version", value: "v1.0.0" },
                { label: "Release Date", value: "May 2026" },
                {
                  label: "COA-Compliant",
                  value: (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 size={10} className="mr-1" />
                      YES
                    </Badge>
                  ),
                },
                {
                  label: "Offline Capable",
                  value: (
                    <Badge variant="secondary" className="text-xs">
                      <WifiOff size={10} className="mr-1" />
                      YES
                    </Badge>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wifi size={15} className="text-primary" />
                Platform Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {PLATFORMS.map((p) => (
                  <div
                    key={p.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-primary flex-shrink-0"
                    />
                    <p.Icon
                      size={14}
                      className="text-muted-foreground flex-shrink-0"
                    />
                    <span className="text-muted-foreground">{p.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Developer Info */}
        <Card className="border-border bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User size={15} className="text-primary" />
              Developer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  IAN BRIX F. BARCENA
                </p>
                <p className="text-xs text-muted-foreground">
                  System Developer / Designer
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <a
                  href="mailto:ianbrixbarcena@gmail.com"
                  className="font-medium text-primary hover:underline flex items-center gap-1.5"
                >
                  <Mail size={12} />
                  ianbrixbarcena@gmail.com
                </a>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground flex-shrink-0">
                  Purpose
                </span>
                <span className="text-right text-foreground font-medium">
                  Modernize SK financial management
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                To modernize SK financial management, improve transparency, and
                reduce manual encoding of financial records for SK officials
                across the Philippines.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            \u00a9 {new Date().getFullYear()} SKeep \u2014 SK Financial
            Management Solution
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Developed by Ian Brix F. Barcena \u2022{" "}
            <a
              href="mailto:ianbrixbarcena@gmail.com"
              className="text-primary hover:underline"
            >
              ianbrixbarcena@gmail.com
            </a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
