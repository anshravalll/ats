import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Brain, Zap, MessageSquare, CheckCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const phaseMeta = {
  think: {
    icon: Brain,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Understanding your requirements',
  },
  act: {
    icon: Zap,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'Ranking candidates by relevance',
  },
  summarize: {
    icon: MessageSquare,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    title: 'Generating insights',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Query Completed',
  },
};

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function CodeBlock({ code }) {
  return (
    <pre className="bg-muted/80 rounded-lg p-3 text-xs overflow-x-auto mt-2 border border-border/40">
      <code>{typeof code === 'string' ? code : JSON.stringify(code, null, 2)}</code>
    </pre>
  );
}

const TimelineStep = ({
  phase,
  active,
  completed,
  timestamp,
  children,
  icon: Icon,
  color,
  bg,
  title,
  expanded,
  onToggleExpand,
  isLast,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className={cn(
      'relative flex gap-3 items-start py-2',
      completed && !active && 'opacity-80',
      active && 'z-10',
    )}
  >
    <div className="flex flex-col items-center relative p-1 overflow-hidden">
      <motion.div
        animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ 
          repeat: active ? Infinity : 0, 
          duration: 1,
          ease: "easeInOut"
        }}
        style={{ transformOrigin: "center" }}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-full border-2',
          color,
          bg,
          active ? 'border-primary shadow-lg' : 'border-border',
        )}
      >
        <Icon className={cn('w-4 h-4', color)} />
      </motion.div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={cn('font-medium', color)}>{title}</span>
        <span className="text-xs text-muted-foreground">{timestamp && formatTime(timestamp)}</span>
        {onToggleExpand && (
          <button
            className="ml-1 p-1 rounded hover:bg-muted/40"
            onClick={onToggleExpand}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>
      <AnimatePresence>{expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}</AnimatePresence>
    </div>
  </motion.div>
);

const AIFeedbackTimeline = ({
  query,
  phase,
  phaseProgress,
  filterPlan,
  rankPlan,
  candidateCount,
  rankedIds,
  summary,
  startTime,
  endTime,
  onClose,
  onCollapse,
  collapsed: collapsedProp,
}) => {
  const [expanded, setExpanded] = useState({
    think: true,
    act: true,
    summarize: true,
    completed: true,
  });
  const [collapsed, setCollapsed] = useState(collapsedProp || false);
  const [isHovered, setIsHovered] = useState(false);

  // Ref for scroll container to control scroll behavior
  const scrollContainerRef = useRef(null);
  const timelineRef = useRef(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      container.scrollTo({ 
        top: container.scrollHeight, 
        behavior: 'smooth' 
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [expanded, filterPlan, rankPlan, summary, rankedIds, phase]);

  // Enhanced scroll lock - prevents ALL outer scrolling when inside component
  const handleWheel = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Always prevent the event from bubbling up
    e.stopPropagation();

    const delta = e.deltaY;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if container is scrollable
    const canScroll = scrollHeight > clientHeight;

    if (!canScroll) {
      // If container can't scroll, prevent all scrolling
      e.preventDefault();
      return;
    }

    // Check if we're at the top or bottom of the container
    const atTop = scrollTop === 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Prevent outer scroll when trying to scroll beyond container limits
    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      e.preventDefault();
    }
    // Allow scrolling within the container (don't preventDefault)
    // but still prevent event bubbling (stopPropagation already called above)
  };

  // Handle mouse enter/leave for additional scroll lock
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Disable body scroll when hovering over component
    document.body.style.overflow = 'hidden';
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Re-enable body scroll when leaving component
    document.body.style.overflow = 'auto';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Timeline data
  const steps = [
    {
      key: 'think',
      ...phaseMeta.think,
      active: phase === 'think',
      completed: phaseProgress.think,
      timestamp: startTime,
      details: (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Query: <span className="font-mono text-foreground">"{query}"</span></div>
          {filterPlan && <>
            <div className="text-xs mt-2">Found <span className="font-bold text-blue-600 dark:text-blue-300">{candidateCount}</span> candidates matching your criteria</div>
            <CodeBlock code={filterPlan} />
          </>}
        </div>
      ),
    },
    {
      key: 'act',
      ...phaseMeta.act,
      active: phase === 'act',
      completed: phaseProgress.act,
      timestamp: phaseProgress.think ? startTime : null,
      details: (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Ranking candidates by relevance</div>
          {typeof candidateCount === 'number' && <div className="text-xs mt-1">{candidateCount} candidates ranked</div>}
          {rankedIds && rankedIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {rankedIds.slice(0, 10).map((id, i) => (
                <span key={id} className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 text-xs font-mono">#{id}</span>
              ))}
            </div>
          )}
          {rankPlan && <>
            <div className="text-xs mt-2">View Ranking Plan</div>
            <CodeBlock code={rankPlan} />
          </>}
        </div>
      ),
    },
    {
      key: 'summarize',
      ...phaseMeta.summarize,
      active: phase === 'summarize',
      completed: phaseProgress.summarize,
      timestamp: phaseProgress.act ? startTime : null,
      details: (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Generating insights</div>
          {summary ? <div className="text-sm mt-2 whitespace-pre-line text-foreground">{summary}</div> : <div className="text-xs italic text-muted-foreground">Waiting for summary...</div>}
        </div>
      ),
    },
    {
      key: 'completed',
      ...phaseMeta.completed,
      active: false,
      completed: phaseProgress.summarize && !!summary,
      timestamp: endTime,
      details: (
        <div>
          <div className="text-xs text-green-700 dark:text-green-300">Completed in <span className="font-bold">{endTime && startTime ? ((endTime - startTime) / 1000).toFixed(2) : '--'}s</span></div>
        </div>
      ),
    },
  ];

  // Only show completed if all phases are done
  const visibleSteps = steps.filter((step, idx) => {
    if (step.key === 'completed') return steps[2].completed && summary;
    return step.completed || step.active || idx === 0;
  });

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.aside
          ref={timelineRef}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl p-4 flex flex-col gap-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold text-card-foreground">Query History</span>
            </div>
            <div className="flex gap-1">
              <button
                className="p-1 rounded hover:bg-muted/40"
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative pl-6 mt-2">
            {/* Single always-green timeline vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-1 bg-green-500 rounded-full z-0" style={{ minHeight: 48, height: '100%' }} />
            <div
              ref={scrollContainerRef}
              className="flex flex-col gap-2 z-10 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              onWheel={handleWheel}
            >
              {visibleSteps.map((step, idx) => (
                <TimelineStep
                  key={step.key}
                  phase={step.key}
                  active={step.active}
                  completed={step.completed}
                  timestamp={step.timestamp}
                  icon={step.icon}
                  color={step.color}
                  bg={step.bg}
                  title={step.title}
                  expanded={expanded[step.key]}
                  onToggleExpand={
                    step.details ? () => setExpanded(e => ({ ...e, [step.key]: !e[step.key] })) : undefined
                  }
                  isLast={idx === visibleSteps.length - 1}
                >
                  {step.details}
                </TimelineStep>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
      {collapsed && (
        <motion.button
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed top-4 right-4 z-50 bg-card/95 border border-border/60 rounded-2xl shadow-lg p-3 flex items-center gap-2 max-w-[calc(100vw-2rem)]"
          onClick={() => setCollapsed(false)}
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium text-card-foreground">Query History</span>
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default AIFeedbackTimeline;
