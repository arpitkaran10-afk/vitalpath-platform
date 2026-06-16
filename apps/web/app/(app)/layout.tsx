'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  MessageCircle,
  Sparkles,
  X,
  Target,
  Camera,
  Activity,
  Bot,
  Utensils,
  BookOpen,
  ArrowRight,
  Mail,
} from 'lucide-react';

// Replace with real entitlement check — true = user has a TGHC coaching plan
const HAS_COACHING = true;

function HealthConciergeModal() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isWideDesktop, setIsWideDesktop] = useState(false);
  const hasCoaching = HAS_COACHING;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const mqWide = window.matchMedia('(min-width: 1280px)');
    setIsDesktop(mq.matches);
    setIsWideDesktop(mqWide.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    const handlerWide = (e: MediaQueryListEvent) => setIsWideDesktop(e.matches);
    mq.addEventListener('change', handler);
    mqWide.addEventListener('change', handlerWide);
    return () => {
      mq.removeEventListener('change', handler);
      mqWide.removeEventListener('change', handlerWide);
    };
  }, []);

  /* ── shared section content atoms ── */

  const storyCard = (compact = false) => (
    <a href="/journey" onClick={() => setOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={compact ? undefined : { scale: 1.005 }}
        whileTap={{ scale: 0.985 }}
        style={{
          background: 'linear-gradient(148deg, #1f3526 0%, #162a1e 52%, #0d1f14 100%)',
          borderRadius: compact ? '20px' : '24px',
          padding: compact ? '28px 24px' : '0',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          height: compact ? undefined : '360px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Cinematic photo layer (desktop) */}
        {!compact && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #2a4a32 0%, #1a3022 40%, #0d1f14 100%)',
          }}>
            {/* Layered glows for depth */}
            <div style={{
              position: 'absolute', top: '-60px', right: '-40px',
              width: '320px', height: '320px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(107,143,113,0.28) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', left: '-20px',
              width: '240px', height: '200px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(195,163,96,0.18) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: '30%', left: '25%',
              width: '280px', height: '200px',
              background: 'radial-gradient(ellipse, rgba(160,205,168,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          </div>
        )}

        {/* Compact glows */}
        {compact && (
          <>
            <div style={{
              position: 'absolute', top: '-40px', right: '-30px',
              width: '140px', height: '140px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(107,143,113,0.22) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-24px', left: '24px',
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(195,163,96,0.14) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          </>
        )}

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: compact ? '0' : '28px 32px 32px',
        }}>
          {!compact && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(107,143,113,0.18)', border: '1px solid rgba(107,143,113,0.28)',
              borderRadius: '20px', padding: '6px 14px', marginBottom: '20px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(160,205,168,0.8)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                Your Story
              </span>
            </div>
          )}
          {compact && (
            <div style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: 'rgba(107,143,113,0.22)', border: '1px solid rgba(107,143,113,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px',
            }}>
              <BookOpen size={21} color="rgba(160,205,168,0.92)" strokeWidth={1.7} />
            </div>
          )}
          {compact && (
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
              Your Story
            </p>
          )}
          <p style={{
            fontSize: compact ? '22px' : '28px', fontWeight: 800,
            color: '#fff', letterSpacing: '-0.02em',
            lineHeight: 1.05, marginBottom: compact ? '10px' : '10px',
          }}>
            YOUR TRANSFORMATION STORY
          </p>
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.58)',
            lineHeight: 1.6, marginBottom: compact ? '22px' : '16px',
            maxWidth: compact ? undefined : '420px',
          }}>
            Capture milestones. Document your journey. Celebrate your progress.
          </p>
          {!compact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '20px' }}>
              {['Month 2 · Day 14', '83% consistency', 'Week 6 streak'].map((tag) => (
                <div key={tag} style={{
                  padding: '5px 10px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.65)',
                }}>
                  {tag}
                </div>
              ))}
            </div>
          )}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#fff', color: '#1f3526',
            padding: compact ? '12px 20px' : '14px 24px',
            borderRadius: '12px', fontWeight: 700, fontSize: compact ? '13px' : '14px',
          }}>
            Continue Story
            <ArrowRight size={compact ? 14 : 16} strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>
    </a>
  );

  const goalsCard = (desktop = false) => (
    <a href="/goals" onClick={() => setOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={desktop ? { y: -2 } : undefined}
        whileTap={{ scale: 0.985 }}
        style={{
          background: desktop
            ? 'linear-gradient(145deg, #f0f7f1 0%, #e6f0e8 100%)'
            : '#fff',
          borderRadius: '18px',
          padding: desktop ? '28px 28px' : '20px',
          border: `1.5px solid rgba(107,143,113,${desktop ? '0.22' : '0.14'})`,
          cursor: 'pointer',
          height: desktop ? '220px' : undefined,
          display: 'flex',
          flexDirection: desktop ? 'column' : 'row',
          alignItems: desktop ? 'flex-start' : 'center',
          gap: '12px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {desktop && (
          <div style={{
            position: 'absolute', top: '-30px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(107,143,113,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{
          width: desktop ? '56px' : '50px', height: desktop ? '56px' : '50px',
          borderRadius: desktop ? '16px' : '14px', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(107,143,113,0.16) 0%, rgba(107,143,113,0.08) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Target size={desktop ? 24 : 22} color="var(--color-sage)" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '3px',
          }}>
            Health Goals
          </p>
          <p style={{
            fontSize: desktop ? '15px' : '15px', fontWeight: 800, color: 'var(--color-ink)',
            letterSpacing: '-0.01em', marginBottom: desktop ? '6px' : '3px',
            lineHeight: 1.2,
          }}>
            UPDATE MY HEALTH GOALS
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.4 }}>
            Stay focused on what matters most.
          </p>
        </div>
        <div style={{
          padding: desktop ? '10px 16px' : '9px 15px',
          background: 'var(--color-sage)', color: '#fff',
          borderRadius: '10px', fontSize: '12px', fontWeight: 700,
          flexShrink: 0, whiteSpace: 'nowrap' as const,
          alignSelf: desktop ? 'flex-end' : 'auto',
          marginTop: desktop ? 'auto' : undefined,
        }}>
          Update Goals
        </div>
      </motion.div>
    </a>
  );

  const mealCard = (desktop = false) => (
    <a
      href={hasCoaching ? '/meal-plan/coach' : '/meal-plan'}
      onClick={() => setOpen(false)}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <motion.div
        whileHover={desktop ? { y: -2 } : undefined}
        whileTap={{ scale: 0.985 }}
        style={{
          background: 'linear-gradient(140deg, #FBF6EE 0%, #F6EDD9 100%)',
          borderRadius: '18px',
          padding: desktop ? '22px 22px' : '22px 20px',
          border: '1.5px solid rgba(195,163,96,0.22)',
          cursor: 'pointer',
          height: desktop ? '220px' : undefined,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {desktop && (
          <div style={{
            position: 'absolute', bottom: '-20px', right: '-16px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(195,163,96,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
          <div style={{
            width: desktop ? '56px' : '50px', height: desktop ? '56px' : '50px',
            borderRadius: desktop ? '16px' : '14px', flexShrink: 0,
            background: 'rgba(195,163,96,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Utensils size={desktop ? 24 : 22} color="var(--color-gold)" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '10px', fontWeight: 700, color: 'rgba(160,130,60,0.8)',
              letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '4px',
            }}>
              Meal Plan
            </p>
            <p style={{
              fontSize: desktop ? '15px' : '15px', fontWeight: 800, color: 'var(--color-ink)',
              letterSpacing: '-0.01em', marginBottom: '6px', lineHeight: 1.2,
            }}>
              PERSONALISED MEAL PLAN
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              {hasCoaching
                ? 'Work with your TGHC coach to create a nutrition plan designed around your goals.'
                : 'Build your own personalised nutrition strategy.'}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'var(--color-gold)', color: '#fff',
              padding: '11px 18px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px',
            }}>
              {hasCoaching ? 'Consult My Coach' : 'Create My Plan'}
              <ArrowRight size={13} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </motion.div>
    </a>
  );

  const progressHub = (desktop = false) => (
    <div>
      {!desktop && (
        <p style={{
          fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)',
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          marginBottom: '10px', paddingLeft: '2px',
        }}>
          Track Progress
        </p>
      )}
      <div style={{
        background: desktop ? 'linear-gradient(145deg, #0d1a10 0%, #162112 100%)' : 'transparent',
        borderRadius: desktop ? '20px' : undefined,
        padding: desktop ? '20px' : undefined,
        border: desktop ? '1px solid rgba(107,143,113,0.18)' : undefined,
        position: 'relative', overflow: desktop ? 'hidden' : undefined,
        height: desktop ? '220px' : undefined,
        display: desktop ? 'flex' : undefined,
        flexDirection: desktop ? 'column' as const : undefined,
        justifyContent: desktop ? 'space-between' : undefined,
      }}>
        {desktop && (
          <>
            <div style={{
              position: 'absolute', top: '-40px', right: '-20px',
              width: '180px', height: '180px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(107,143,113,0.18) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div>
              <p style={{
                fontSize: '10px', fontWeight: 700, color: 'rgba(160,205,168,0.55)',
                letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '3px',
              }}>
                Progress Hub
              </p>
              <p style={{
                fontSize: '15px', fontWeight: 800, color: '#fff',
                letterSpacing: '-0.02em', marginBottom: '0',
              }}>
                Track Your Progress
              </p>
            </div>
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Selfie card */}
          <a href="/progress/selfie" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={desktop ? { y: -2 } : undefined}
              whileTap={{ scale: 0.97 }}
              style={{
                background: desktop
                  ? 'linear-gradient(148deg, rgba(60,43,26,0.9) 0%, rgba(90,61,38,0.9) 100%)'
                  : 'linear-gradient(148deg, #3C2B1A 0%, #5A3D26 100%)',
                borderRadius: '14px', padding: desktop ? '14px 14px' : '20px 16px',
                minHeight: desktop ? undefined : '136px',
                height: desktop ? '110px' : undefined,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
                border: desktop ? '1px solid rgba(195,163,96,0.15)' : undefined,
              }}
            >
              <div style={{
                position: 'absolute', top: '-22px', right: '-18px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: desktop ? '30px' : '38px', height: desktop ? '30px' : '38px',
                borderRadius: '9px', background: 'rgba(255,255,255,0.13)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={desktop ? 14 : 18} color="#fff" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: desktop ? '11px' : '13px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '3px' }}>
                  Upload Progress Selfie
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                    {desktop ? 'Click to upload' : 'Tap to upload'}
                  </span>
                  <ArrowRight size={9} color="rgba(255,255,255,0.45)" />
                </div>
              </div>
            </motion.div>
          </a>

          {/* Biomarkers card */}
          <a href="/progress/biomarkers" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={desktop ? { y: -2 } : undefined}
              whileTap={{ scale: 0.97 }}
              style={{
                background: desktop
                  ? 'linear-gradient(148deg, rgba(25,45,60,0.9) 0%, rgba(36,60,82,0.9) 100%)'
                  : 'linear-gradient(148deg, #192D3C 0%, #243C52 100%)',
                borderRadius: '14px', padding: desktop ? '14px 14px' : '20px 16px',
                minHeight: desktop ? undefined : '136px',
                height: desktop ? '110px' : undefined,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
                border: desktop ? '1px solid rgba(100,160,210,0.15)' : undefined,
              }}
            >
              <div style={{
                position: 'absolute', top: '-22px', right: '-18px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: desktop ? '30px' : '38px', height: desktop ? '30px' : '38px',
                borderRadius: '9px', background: 'rgba(255,255,255,0.13)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={desktop ? 14 : 18} color="#fff" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: desktop ? '11px' : '13px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '3px' }}>
                  Log Biomarkers
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Track metrics</span>
                  <ArrowRight size={9} color="rgba(255,255,255,0.45)" />
                </div>
              </div>
            </motion.div>
          </a>
        </div>
      </div>
    </div>
  );

  const briefingCard = (desktop = false) => (
    <div style={{
      background: desktop
        ? 'linear-gradient(145deg, #1e2e1f 0%, #162318 100%)'
        : '#fff',
      borderRadius: desktop ? '20px' : '18px',
      padding: desktop ? '20px 22px' : '22px 20px',
      border: desktop ? '1px solid rgba(107,143,113,0.2)' : '1.5px solid var(--color-border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {desktop && (
        <div style={{
          position: 'absolute', top: '-30px', right: '-20px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(195,163,96,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div style={{
          width: desktop ? '52px' : '50px', height: desktop ? '52px' : '50px',
          borderRadius: desktop ? '15px' : '14px', flexShrink: 0,
          background: desktop
            ? 'rgba(195,163,96,0.16)'
            : 'linear-gradient(135deg, rgba(30,60,40,0.09) 0%, rgba(30,60,40,0.04) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mail size={22} color={desktop ? 'rgba(212,168,67,0.9)' : 'var(--color-ink)'} strokeWidth={1.7} />
        </div>
        <div>
          <p style={{
            fontSize: '10px', fontWeight: 700,
            color: desktop ? 'rgba(212,168,67,0.65)' : 'var(--color-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '3px',
          }}>
            Exclusive Member Content
          </p>
          <p style={{
            fontSize: '15px', fontWeight: 800,
            color: desktop ? '#fff' : 'var(--color-ink)',
            letterSpacing: '-0.01em', marginBottom: '4px', lineHeight: 1.2,
          }}>
            YOUR PERSONAL HEALTH BRIEFING
          </p>
          <p style={{ fontSize: '12px', color: desktop ? 'rgba(255,255,255,0.45)' : 'var(--color-muted)', lineHeight: 1.4 }}>
            Weekly insights tailored to your goals and progress.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <a href="/briefing/subscribe" onClick={() => setOpen(false)} style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{
            padding: '12px',
            background: desktop ? 'rgba(212,168,67,0.9)' : 'var(--color-ink)',
            color: desktop ? '#1a1400' : '#fff',
            borderRadius: '12px', fontWeight: 700, fontSize: '13px',
            textAlign: 'center' as const, cursor: 'pointer',
          }}>
            Subscribe
          </div>
        </a>
        <a href="/briefing" onClick={() => setOpen(false)} style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{
            padding: '12px',
            background: 'transparent',
            color: desktop ? 'rgba(255,255,255,0.7)' : 'var(--color-ink)',
            border: desktop ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid var(--color-border)',
            borderRadius: '12px', fontWeight: 700, fontSize: '13px',
            textAlign: 'center' as const, cursor: 'pointer',
          }}>
            View Previous Editions
          </div>
        </a>
      </div>
    </div>
  );

  const askCard = (desktop = false) => (
    <a href="/ask" onClick={() => setOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={desktop ? { scale: 1.005 } : undefined}
        whileTap={{ scale: 0.985 }}
        style={{
          background: 'linear-gradient(148deg, #090f08 0%, #0e1c0f 28%, #090c17 68%, #0c0910 100%)',
          borderRadius: '20px',
          padding: desktop ? '24px 24px' : '28px 24px',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          height: desktop ? '240px' : undefined,
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}
      >
        {/* Aurora glows — kept small to avoid repaint cost */}
        <div style={{
          position: 'absolute', top: '8px', right: '16px',
          width: '130px', height: '100px',
          background: 'radial-gradient(ellipse, rgba(107,143,113,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '8px', left: '24px',
          width: '100px', height: '80px',
          background: 'radial-gradient(ellipse, rgba(100,80,190,0.13) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: desktop ? '20px' : '18px' }}>
            <div style={{
              width: desktop ? '52px' : '46px', height: desktop ? '52px' : '46px',
              borderRadius: '14px',
              background: 'rgba(107,143,113,0.2)', border: '1px solid rgba(107,143,113,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={desktop ? 22 : 20} color="rgba(160,205,168,0.92)" strokeWidth={1.7} />
            </div>
            <p style={{
              fontSize: '10px', fontWeight: 700,
              color: 'rgba(160,205,168,0.6)',
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            }}>
              AI Health Companion
            </p>
          </div>

          <p style={{
            fontSize: desktop ? '24px' : '24px', fontWeight: 800, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '8px',
          }}>
            ASK ME ANYTHING
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, marginBottom: '4px' }}>
            Food. Exercise. Sleep. Stress. Health habits.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.5, marginBottom: desktop ? '0' : '22px' }}>
            Your AI health companion is available whenever you need support.
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(107,143,113,0.22)', border: '1px solid rgba(107,143,113,0.32)',
          color: 'rgba(170,215,175,0.95)',
          padding: desktop ? '14px 22px' : '12px 20px', borderRadius: '12px',
          fontWeight: 700, fontSize: desktop ? '14px' : '13px',
          alignSelf: 'flex-start' as const,
        }}>
          Ask A Question
          <ArrowRight size={desktop ? 15 : 14} strokeWidth={2.5} />
        </div>
      </motion.div>
    </a>
  );

  const supportCard = (desktop = false) => (
    <a
      href={hasCoaching ? '/coach/message' : '/ai-coach'}
      onClick={() => setOpen(false)}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <motion.div
        whileHover={desktop ? { y: -2 } : undefined}
        whileTap={{ scale: 0.985 }}
        style={{
          background: desktop
            ? hasCoaching
              ? 'linear-gradient(145deg, #1a2e1c 0%, #243824 100%)'
              : 'linear-gradient(145deg, #1a1230 0%, #251840 100%)'
            : '#fff',
          borderRadius: '18px',
          padding: desktop ? '22px 22px' : '20px',
          border: desktop
            ? hasCoaching
              ? '1px solid rgba(107,143,113,0.24)'
              : '1px solid rgba(100,80,190,0.24)'
            : '1.5px solid rgba(107,143,113,0.14)',
          display: 'flex', flexDirection: desktop ? 'column' : 'row',
          alignItems: desktop ? 'flex-start' : 'center',
          gap: '12px', cursor: 'pointer',
          height: desktop ? '220px' : undefined,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {desktop && (
          <div style={{
            position: 'absolute', bottom: '-30px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: `radial-gradient(circle, ${hasCoaching ? 'rgba(107,143,113,0.18)' : 'rgba(100,80,190,0.18)'} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
        )}
        <div style={{
          width: desktop ? '56px' : '50px', height: desktop ? '56px' : '50px',
          borderRadius: desktop ? '16px' : '14px', flexShrink: 0,
          background: hasCoaching
            ? 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%)'
            : 'linear-gradient(135deg, #3D1A5A 0%, #2A1240 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {hasCoaching
            ? <MessageCircle size={desktop ? 24 : 22} color="#fff" strokeWidth={1.8} />
            : <Bot size={desktop ? 24 : 22} color="#fff" strokeWidth={1.8} />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '10px', fontWeight: 700,
            color: desktop ? (hasCoaching ? 'rgba(160,205,168,0.55)' : 'rgba(190,170,230,0.55)') : 'var(--color-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '4px',
          }}>
            Support
          </p>
          <p style={{
            fontSize: '15px', fontWeight: 800,
            color: desktop ? '#fff' : 'var(--color-ink)',
            letterSpacing: '-0.01em', marginBottom: desktop ? '6px' : '3px',
            lineHeight: 1.2,
          }}>
            {hasCoaching ? 'TALK TO YOUR COACH' : 'TALK TO YOUR AI COACH'}
          </p>
          <p style={{ fontSize: '12px', color: desktop ? 'rgba(255,255,255,0.45)' : 'var(--color-muted)', lineHeight: 1.4 }}>
            {hasCoaching
              ? 'Get personalised guidance from your TGHC coach.'
              : 'Ask questions anytime. Get guidance instantly.'}
          </p>
        </div>
        <div style={{
          padding: desktop ? '11px 18px' : '9px 15px',
          background: hasCoaching
            ? 'var(--color-sage)'
            : 'linear-gradient(135deg, #3D1A5A 0%, #2A1240 100%)',
          color: '#fff',
          borderRadius: '10px', fontSize: '12px', fontWeight: 700,
          flexShrink: 0, whiteSpace: 'nowrap' as const,
          alignSelf: desktop ? 'flex-end' : 'auto',
          marginTop: desktop ? 'auto' : undefined,
        }}>
          {hasCoaching ? 'Message Coach' : 'Start Conversation'}
        </div>
      </motion.div>
    </a>
  );

  /* ── desktop modal header ── */
  const desktopHeader = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 36px 20px', flexShrink: 0,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(107,143,113,0.2)', border: '1px solid rgba(107,143,113,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={18} color="rgba(160,205,168,0.9)" strokeWidth={1.7} />
        </div>
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: 'rgba(160,205,168,0.6)',
            letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '2px',
          }}>
            Your Health Concierge
          </p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            Health Command Center
          </p>
        </div>
      </div>
      <button
        onClick={() => setOpen(false)}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <X size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
      </button>
    </div>
  );

  /* ── mobile modal (unchanged behaviour) ── */
  const mobileModal = (
    <motion.div
      key="concierge-modal-mobile"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.9 }}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
        height: '88vh', background: '#F7F6F2',
        borderRadius: '24px 24px 0 0', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 48px rgba(0,0,0,0.28)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px', flexShrink: 0 }}>
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.13)' }} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '16px 24px 18px', flexShrink: 0,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sage)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>
            Your Health Concierge
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5, maxWidth: '260px' }}>
            Everything you need to continue your transformation journey.
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid var(--color-border)', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, marginLeft: '12px',
          }}
        >
          <X size={15} color="var(--color-ink)" strokeWidth={2} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
          {storyCard(true)}
          {goalsCard(false)}
          {mealCard(false)}
          {progressHub(false)}
          {supportCard(false)}
          {askCard(false)}
          {briefingCard(false)}
        </div>
      </div>
    </motion.div>
  );

  /* ── desktop modal ── */
  const desktopModal = (
    /* Outer: full-screen flex centering layer — animates opacity + scale only */
    <motion.div
      key="concierge-modal-desktop"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.8 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 401,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        /* pointer-events on the backdrop div handles close; panel stops propagation */
        pointerEvents: 'none',
      }}
    >
      {/* Inner: the actual modal panel — stops propagation so clicks inside don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          pointerEvents: 'auto',
          width: 'min(92vw, 1400px)',
          height: 'min(85vh, 900px)',
          background: 'linear-gradient(155deg, #0f1e11 0%, #111e18 40%, #0c1218 100%)',
          borderRadius: '28px',
          /* overflow:hidden clips scroll; use clip instead so borders/radius hold but layout isn't restricted */
          overflow: 'clip',
          display: 'flex', flexDirection: 'column',
          /* single shadow — no stacked layers */
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          outline: '1px solid rgba(255,255,255,0.07)',
          position: 'relative',
          /* promote to own compositor layer */
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        {/* Ambient glows — reduced size to cut repaint cost */}
        <div style={{
          position: 'absolute', top: '-40px', left: '20%',
          width: '240px', height: '180px',
          background: 'radial-gradient(ellipse, rgba(107,143,113,0.1) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', right: '15%',
          width: '200px', height: '150px',
          background: 'radial-gradient(ellipse, rgba(195,163,96,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Content layer — flex:1 + minHeight:0 is more robust than height:100% in a flex parent */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Sticky header — flexShrink:0 keeps it out of scroll */}
          <div style={{ flexShrink: 0 }}>{desktopHeader}</div>

          {/* Single scroll wrapper — only this element scrolls */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            scrollbarWidth: 'none' as const,
            willChange: 'transform',
          }}>
            {/* Two-column grid — grows to natural content height, no scroll/clip on columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isWideDesktop ? '65fr 35fr' : '1fr 1fr',
              minHeight: '100%',
              alignItems: 'start',
            }}>
              {/* LEFT column — no overflow constraint, grows naturally */}
              <div style={{
                padding: '20px 16px 48px 28px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                borderRight: '1px solid rgba(255,255,255,0.06)',
              }}>
                {storyCard(false)}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {goalsCard(true)}
                  {progressHub(true)}
                </div>
                {briefingCard(true)}
              </div>

              {/* RIGHT column — no overflow constraint, grows naturally */}
              <div style={{
                padding: '20px 28px 48px 16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {askCard(true)}
                {mealCard(true)}
                {supportCard(true)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* FAB trigger */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 300 }}>
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          title="Continue Your Journey"
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--color-sage)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(107,143,113,0.4), 0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <Sparkles size={22} color="#fff" strokeWidth={2} />
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="concierge-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 400,
                background: isDesktop
                  ? 'radial-gradient(ellipse at 50% 50%, rgba(8,20,12,0.76) 0%, rgba(4,10,6,0.86) 100%)'
                  : 'rgba(8,16,10,0.72)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            {isDesktop ? desktopModal : mobileModal}
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      {/* Top nav */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: '#fff',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 200,
        boxShadow: '0 1px 0 var(--color-border)',
      }}>
        {/* Left: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-ink)',
            letterSpacing: '-0.03em',
          }}>
            VitalPath
          </span>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            border: '1.5px solid var(--color-border)',
            borderRadius: '20px',
            background: 'transparent',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-ink)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-sage) 0%, var(--color-gold) 100%)',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            Complete Profile (2/3)
          </button>
          <button style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-border)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-muted)',
          }}>
            <MessageCircle size={16} />
          </button>
          <button style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-border)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-muted)',
          }}>
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Body below nav */}
      <div style={{
        display: 'flex',
        marginTop: '56px',
        minHeight: 'calc(100vh - 56px)',
        alignItems: 'flex-start',
      }}>
        {/* Main content */}
        <main style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: '40px',
          overflow: 'visible',
        }}>
          {children}
        </main>

      </div>

      <HealthConciergeModal />
    </div>
  );
}
