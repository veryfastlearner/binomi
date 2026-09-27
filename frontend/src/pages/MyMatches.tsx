import { useEffect, useState } from 'react';
import { useEntry } from '@/contexts/EntryContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { matchesApi, negotiationLogApi, API_URL } from '@/lib/api';
import { Mail, Calendar, ChevronDown, ChevronUp, User, MessageSquare, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function MyMatchesPage() {
  const { user } = useEntry();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [showIncompat, setShowIncompat] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewingLog, setViewingLog] = useState<string | null>(null);
  const [logData, setLogData] = useState<any>(null);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    matchesApi.counts(user.user_id).then(setCounts).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    matchesApi.list(user.user_id, showIncompat).then(setMatches).catch(() => setMatches([]));
  }, [user, showIncompat]);

  const otherName = (m: any) => m.user_a_id === user?.user_id ? m.user_b_name : m.user_a_name;
  const otherId = (m: any) => m.user_a_id === user?.user_id ? m.user_b_id : m.user_a_id;
  const otherPhoto = (m: any) => {
    const photos = m.other_photos || [];
    if (photos.length > 0) return `${API_URL}${photos[0]}`;
    return m.other_profile_picture || null;
  };

  const handleViewLog = async (matchId: string) => {
    setLogLoading(true);
    try {
      const log = await negotiationLogApi.get(matchId);
      setLogData(log);
      setViewingLog(matchId);
    } catch (err) {
      console.error('Failed to load negotiation log:', err);
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">My Matches {counts ? `(${counts.total})` : ''}</h1>
          <div className="flex items-center gap-2">
            <Switch id="incompat" checked={showIncompat} onCheckedChange={setShowIncompat} />
            <Label htmlFor="incompat" className="text-sm">Show incompatible</Label>
          </div>
        </div>

        {counts && (
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-match-strong" /> {counts.strong} strong</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-match-conditional" /> {counts.conditional} conditional</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-match-incompatible" /> {counts.incompatible} incompatible</span>
          </div>
        )}

        {matches.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No matches yet. Run a compatibility match to see results here.</p>
        )}

        <div className="space-y-3">
          {matches.map((m, i) => {
            const isExpanded = expanded === m.match_id;
            const scores = m.analysis?.structured && m.analysis?.data?.scores;
            return (
              <motion.div key={m.match_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-0 shadow-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {otherPhoto(m) ? (
                          <img src={otherPhoto(m)} alt={otherName(m)} className="w-12 h-12 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User size={20} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-display font-semibold text-lg">{otherName(m)}</p>
                          <StatusBadge status={m.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {m.created_at ? format(new Date(m.created_at), 'MMM d, yyyy') : '–'}</span>
                          {scores && <span>Score: {scores.overall}/100</span>}
                        </div>
                        {m.status === 'conditional' && m.unresolved_topics?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {m.unresolved_topics.map((t: string) => (
                              <span key={t} className="rounded-full bg-match-conditional/20 text-match-conditional-foreground px-2 py-0.5 text-xs">{t}</span>
                            ))}
                          </div>
                        )}
                        {m.status === 'incompatible' && m.reason && (
                          <p className="mt-1 text-sm text-destructive">{m.reason}</p>
                        )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLog(m.match_id)}
                          disabled={logLoading}
                        >
                          <Eye size={14} className="mr-1" /> View Negotiation
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setExpanded(isExpanded ? null : m.match_id)}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-4 border-t pt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-primary" />
                          <span>{otherId(m)}</span>
                        </div>
                        {scores && (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {['finances', 'lifestyle', 'personality', 'logistics'].map(k => (
                              <div key={k} className="rounded-lg bg-muted p-2 text-center">
                                <p className="font-bold">{scores[k] ?? '–'}</p>
                                <p className="text-xs capitalize text-muted-foreground">{k}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {m.analysis?.data?.recommendation_summary && (
                          <div className="rounded-lg bg-accent p-3">
                            <p className="text-sm font-semibold mb-1">Summary</p>
                            <p className="text-sm text-muted-foreground">{m.analysis.data.recommendation_summary}</p>
                          </div>
                        )}
                        {m.analysis?.data?.highlights?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-1">✅ Highlights</p>
                            <ul className="text-sm text-muted-foreground space-y-1">{m.analysis.data.highlights.map((h: string, i: number) => <li key={i}>• {h}</li>)}</ul>
                          </div>
                        )}
                        {m.analysis?.data?.concerns?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-1">⚠️ Concerns</p>
                            <ul className="text-sm text-muted-foreground space-y-1">{m.analysis.data.concerns.map((c: string, i: number) => <li key={i}>• {c}</li>)}</ul>
                          </div>
                        )}
                        {m.analysis?.data?.middle_ground?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-1">🤝 Middle Ground</p>
                            <ul className="text-sm text-muted-foreground space-y-1">{m.analysis.data.middle_ground.map((mg: string, i: number) => <li key={i}>• {mg}</li>)}</ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Negotiation Log Modal */}
        {viewingLog && logData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => { setViewingLog(null); setLogData(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl shadow-elevated w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-display text-lg font-semibold">Negotiation Log</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Match: {viewingLog}</span>
                  <Button variant="ghost" size="icon" onClick={() => { setViewingLog(null); setLogData(null); }}>
                    <X size={20} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Conversation */}
                {(logData.conversation || []).map((msg: any, idx: number) => (
                  <div key={idx} className={`flex ${msg.speaker_id === 'a' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.speaker_id === 'a' ? 'bg-accent text-accent-foreground rounded-bl-sm' : 'bg-primary text-primary-foreground rounded-br-sm'
                    }`}>
                      <p className="text-xs font-semibold mb-1 opacity-70">{msg.speaker} <span className="text-xs text-muted-foreground">(Turn {msg.turn}, {msg.phase})</span></p>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {/* Analysis */}
                {logData.analysis?.structured && logData.analysis.data && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold">Analysis</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-display text-3xl font-bold text-primary">{logData.analysis.data.scores?.overall ?? '–'}</p>
                        <p className="text-xs text-muted-foreground">Overall Score</p>
                      </div>
                      <StatusBadge status={logData.analysis.data.recommendation || logData.outcome?.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {['finances', 'lifestyle', 'personality', 'logistics'].map(k => (
                        <div key={k} className="rounded-lg bg-muted p-3 text-center">
                          <p className="font-display text-xl font-bold">{logData.analysis.data.scores?.[k] ?? '–'}</p>
                          <p className="text-xs capitalize text-muted-foreground">{k}</p>
                        </div>
                      ))}
                    </div>
                    {logData.analysis.data.dealbreaker_detected && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <p className="text-sm font-semibold text-destructive">⚠️ Dealbreaker Detected</p>
                        <p className="text-sm text-destructive/80">{logData.analysis.data.dealbreaker_detail}</p>
                      </div>
                    )}
                    {logData.analysis.data.highlights?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-1">✅ Highlights</p>
                        <ul className="text-sm text-muted-foreground space-y-1">{logData.analysis.data.highlights.map((h: string, i: number) => <li key={i}>• {h}</li>)}</ul>
                      </div>
                    )}
                    {logData.analysis.data.concerns?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-1">⚠️ Concerns</p>
                        <ul className="text-sm text-muted-foreground space-y-1">{logData.analysis.data.concerns.map((c: string, i: number) => <li key={i}>• {c}</li>)}</ul>
                      </div>
                    )}
                    {logData.analysis.data.middle_ground?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-1">🤝 Middle Ground</p>
                        <ul className="text-sm text-muted-foreground space-y-1">{logData.analysis.data.middle_ground.map((m: string, i: number) => <li key={i}>• {m}</li>)}</ul>
                      </div>
                    )}
                    {logData.analysis.data.recommendation_summary && (
                      <div className="rounded-lg bg-accent p-3">
                        <p className="text-sm font-semibold mb-1">Summary</p>
                        <p className="text-sm text-muted-foreground">{logData.analysis.data.recommendation_summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}