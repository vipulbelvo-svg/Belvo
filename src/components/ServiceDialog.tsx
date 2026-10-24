import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ServiceItem } from "@/content/services";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { smoothScrollToElement } from "@/lib/smoothScroll";

interface ServiceDialogProps {
  service: ServiceItem | null;
  onClose: () => void;
}

export default function ServiceDialog({ service, onClose }: ServiceDialogProps) {
  const handleBookCall = () => {
    onClose();
    setTimeout(() => {
      smoothScrollToElement("book-call");
    }, 150);
  };

  return (
    <Dialog open={!!service} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        style={{
          maxWidth: "800px",
          width: "min(92vw, 800px)",
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: "24px",
          padding: 0,
          border: "1px solid rgba(130, 40, 200, 0.35)",
          background: "#0c0816",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {service && (
          <div style={{ padding: "32px 32px 36px" }}>
            <DialogHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    background: "rgba(123, 47, 190, 0.15)",
                    border: "1px solid rgba(123, 47, 190, 0.35)",
                    color: "#c794ff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {service.pillar || "Belvo Service"}
                </span>
              </div>
              <DialogTitle
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(1.4rem, 3vw, 1.85rem)",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                {service.title}
              </DialogTitle>
              <DialogDescription
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "rgba(255, 255, 255, 0.72)",
                  lineHeight: 1.8,
                  fontSize: "0.95rem",
                  marginTop: "12px",
                }}
              >
                {service.desc}
              </DialogDescription>
            </DialogHeader>

            {/* Key Deliverables */}
            {service.deliverables && service.deliverables.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#c794ff",
                    marginBottom: "12px",
                  }}
                >
                  Key Deliverables
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
                  {service.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        fontSize: "0.85rem",
                        color: "rgba(255, 255, 255, 0.85)",
                        lineHeight: 1.5,
                      }}
                    >
                      <CheckCircle2 size={16} color="#c794ff" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
              {service.keywords.map(keyword => (
                <span
                  key={keyword}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* Action CTA */}
            <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleBookCall}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #7B2FBE, #a855f7)",
                  color: "#ffffff",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.86rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(123, 47, 190, 0.4)",
                }}
              >
                Discuss This Service With Us <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
