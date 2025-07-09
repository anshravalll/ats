"use client";

import { useEffect, useState } from "react";
import { useCandidates } from "../../lib/context/CandidateContext";

const InfoRow = ({ label, value }) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  )
    return null;
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="font-medium text-card-foreground min-w-[120px]">
        {label}:
      </span>
      <span>{value}</span>
    </div>
  );
};

const Chip = ({
  children,
  color = "bg-primary/10 text-primary border-primary/20",
}) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}
  >
    {children}
  </span>
);

const isNonEmptyArray = (arr) =>
  Array.isArray(arr) && arr.filter(Boolean).length > 0;

const CandidateModal = () => {
  const { selectedCandidate, setSelectedCandidate } = useCandidates();
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (selectedCandidate && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [selectedCandidate]);

  if (!selectedCandidate) return null;

  const {
    // avatar, // removed
    name,
    full_name,
    title,
    location,
    email,
    phone,
    linkedin_url,
    years_experience,
    experience,
    salary,
    desired_salary_usd,
    notice_period_weeks,
    remote_experience_years,
    skills = [],
    languages = "",
    education_level,
    degree_major,
    work_preference,
    availability,
    availability_weeks,
    open_to_contract,
    willing_to_relocate,
    visa_status,
    citizenships,
    tags = "",
    last_active,
    summary,
  } = selectedCandidate;

  // Parse languages and tags
  const languageList =
    typeof languages === "string"
      ? languages
          .split(";")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];
  const tagList =
    typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-border">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Candidate Details
          </h2>
          <button
            onClick={() => setSelectedCandidate(null)}
            className="text-muted-foreground hover:text-foreground text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Header (no avatar) */}
          <div>
            <h3 className="text-xl font-semibold text-card-foreground">
              {(full_name || name) ?? ""}
            </h3>
            {title && <p className="text-muted-foreground">{title}</p>}
            {location && (
              <p className="text-sm text-muted-foreground">📍 {location}</p>
            )}
          </div>

          {/* Summary */}
          {typeof summary === "string" && summary.trim().length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-card-foreground">
              <span className="font-semibold">Summary:</span> {summary}
            </div>
          )}

          {/* Contact Info */}
          {(email || phone || linkedin_url) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Contact Information
              </h4>
              <div className="space-y-1">
                <InfoRow
                  label="Email"
                  value={
                    email ? (
                      <a
                        href={`mailto:${email}`}
                        className="underline hover:text-primary"
                      >
                        {email}
                      </a>
                    ) : null
                  }
                />
                <InfoRow label="Phone" value={phone} />
                <InfoRow
                  label="LinkedIn"
                  value={
                    linkedin_url ? (
                      <a
                        href={linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        Profile
                      </a>
                    ) : null
                  }
                />
              </div>
            </div>
          )}

          {/* Experience & Salary */}
          {(years_experience ||
            experience ||
            desired_salary_usd ||
            salary ||
            notice_period_weeks ||
            availability ||
            remote_experience_years) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Experience & Salary
              </h4>
              <div className="space-y-1">
                <InfoRow
                  label="Years Experience"
                  value={years_experience ?? experience}
                />
                <InfoRow
                  label="Salary"
                  value={
                    desired_salary_usd || salary
                      ? `$${(desired_salary_usd ?? salary)?.toLocaleString()}/year`
                      : null
                  }
                />
                <InfoRow
                  label="Notice Period"
                  value={
                    notice_period_weeks !== undefined &&
                    notice_period_weeks !== null
                      ? `${notice_period_weeks} weeks`
                      : availability || null
                  }
                />
                <InfoRow
                  label="Remote Experience"
                  value={
                    remote_experience_years !== undefined &&
                    remote_experience_years !== null
                      ? `${remote_experience_years} years`
                      : null
                  }
                />
              </div>
            </div>
          )}

          {/* Skills */}
          {isNonEmptyArray(skills) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.filter(Boolean).map((skill, index) => (
                  <Chip key={index}>{skill}</Chip>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {isNonEmptyArray(languageList) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {languageList.map((lang, idx) => (
                  <Chip
                    key={idx}
                    color="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700"
                  >
                    {lang}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(education_level || degree_major) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Education
              </h4>
              <div className="space-y-1">
                <InfoRow label="Level" value={education_level} />
                <InfoRow label="Major" value={degree_major} />
              </div>
            </div>
          )}

          {/* Work Preferences */}
          {(work_preference ||
            availability_weeks ||
            availability ||
            open_to_contract !== undefined ||
            willing_to_relocate !== undefined) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Work Preferences
              </h4>
              <div className="space-y-1">
                <InfoRow label="Preference" value={work_preference} />
                <InfoRow
                  label="Availability"
                  value={
                    availability_weeks !== undefined &&
                    availability_weeks !== null
                      ? `${availability_weeks} weeks`
                      : availability || null
                  }
                />
                {open_to_contract !== undefined &&
                  open_to_contract !== null && (
                    <InfoRow
                      label="Open to Contract"
                      value={
                        <span
                          className={
                            open_to_contract ? "text-green-600" : "text-red-500"
                          }
                        >
                          {open_to_contract ? "Yes" : "No"}
                        </span>
                      }
                    />
                  )}
                {willing_to_relocate !== undefined &&
                  willing_to_relocate !== null && (
                    <InfoRow
                      label="Willing to Relocate"
                      value={
                        <span
                          className={
                            willing_to_relocate
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {willing_to_relocate ? "Yes" : "No"}
                        </span>
                      }
                    />
                  )}
              </div>
            </div>
          )}

          {/* Visa & Citizenship */}
          {(visa_status || citizenships) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Visa & Citizenship
              </h4>
              <div className="space-y-1">
                <InfoRow label="Visa Status" value={visa_status} />
                <InfoRow label="Citizenships" value={citizenships} />
              </div>
            </div>
          )}

          {/* Tags */}
          {isNonEmptyArray(tagList) && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag, idx) => (
                  <Chip
                    key={idx}
                    color="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Last Active */}
          {last_active && (
            <div>
              <h4 className="font-semibold text-card-foreground mb-2">
                Last Active
              </h4>
              <div className="text-sm text-muted-foreground">{last_active}</div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex pt-4 border-t border-border">
            <button
              className="btn btn-outline flex-1"
              onClick={() => setShowJson((v) => !v)}
            >
              {showJson ? "Hide JSON" : "Show JSON"}
            </button>
          </div>

          {showJson && (
            <div className="mt-4 bg-muted/80 rounded-lg p-4 text-xs overflow-x-auto border border-border">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(selectedCandidate, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
