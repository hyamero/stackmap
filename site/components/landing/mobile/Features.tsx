import { SITE } from '@/lib/site-data';
import { s } from '../style';

export function Features() {
  return (
    <>
      <section className="feat-sec" data-theme-sec="light" data-sec="features" aria-labelledby="feat-h-m" data-theme="light">
        <i className="rline" aria-hidden="true"></i>
        <div className="feat-in">
          <h2 className="feat-h" id="feat-h-m" data-rv="lines">
            <span className="ml">
              <span>Trace. Route.</span>
            </span>
            <span className="ml">
              <span className="acc" style={s({ transitionDelay: '90ms' })}>
                Play.
              </span>
            </span>
          </h2>
          <p className="feat-lede" data-rv="">
            The viewer above is the real thing, cut down to one diagram. Here is what each control does in the file your agent delivers.
          </p>
          <div className="feat-g">
            <div className="feat" data-rv="" style={s({ transitionDelay: '0ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m21 21-4.34-4.34" />
                  <circle cx="11" cy="11" r="8" />
                </svg>
                <span>Explore</span>
              </h3>
              <p>A card’s details, connections and the file and line behind it.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '70ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 6a9 9 0 0 0-9 9V3" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                </svg>
                <span>Trace</span>
              </h3>
              <p>Keep a node’s upstream and downstream; the rest dims.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '0ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="6" cy="19" r="3" />
                  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                  <circle cx="18" cy="5" r="3" />
                </svg>
                <span>Route</span>
              </h3>
              <p>Every path between two nodes, lit hop by hop.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '70ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                  <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                  <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
                </svg>
                <span>Find</span>
              </h3>
              <p>Search titles, ids and types, or dim a type with the lens.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '0ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 3h20" />
                  <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                  <path d="m7 21 5-5 5 5" />
                </svg>
                <span>Guided views</span>
              </h3>
              <p>Tabs your agent defines, presented full screen.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '70ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
                <span>Play</span>
              </h3>
              <p>Pulses travel whatever you’re looking at.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '0ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </svg>
                <span>Share</span>
              </h3>
              <p>The URL keeps the view. Export images or a video.</p>
            </div>
            <div className="feat" data-rv="" style={s({ transitionDelay: '70ms' })}>
              <h3 className="feat-t">
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
                <span>Themes</span>
              </h3>
              <p>Dark and light. Reduced motion is respected.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
