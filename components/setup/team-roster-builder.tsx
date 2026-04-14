'use client';

import { useState } from 'react';

const roleOptions = [
  { value: 'shift_lead', label: 'Manager' },
  { value: 'kitchen', label: 'Production' },
  { value: 'sales', label: 'Orders' },
  { value: 'owner_admin', label: 'Admin' },
] as const;

const workspaceOptions = [
  { value: 'orders', label: 'Orders' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'production', label: 'Production' },
  { value: 'customers', label: 'Customers' },
  { value: 'handoff', label: 'Handoff' },
  { value: 'admin', label: 'Admin' },
] as const;

type TeamRosterBuilderProps = {
  initialRows?: number;
};

export function TeamRosterBuilder({ initialRows = 1 }: TeamRosterBuilderProps) {
  const [count, setCount] = useState(Math.max(1, Math.min(12, initialRows)));

  return (
    <div className="page-stack">
      {Array.from({ length: count }, (_, index) => {
        const row = index + 1;

        return (
          <div key={row} className="subpanel page-stack">
            <div className="table-header-row">
              <h3>Team member {row}</h3>
              {count > 1 ? (
                <button type="button" className="button-ghost compact-button" onClick={() => setCount(Math.max(1, count - 1))}>
                  Remove last
                </button>
              ) : null}
            </div>
            <div className="grid-two">
              <label>
                <span className="field-heading">Full name</span>
                <input name={`teamDisplayName${row}`} placeholder={row === 1 ? 'Alex Rivera' : 'Team member'} />
              </label>
              <label>
                <span className="field-heading">Username</span>
                <input name={`teamUsername${row}`} placeholder={row === 1 ? 'alex' : 'username'} />
                <span className="helper-text">Usernames can be simple. Password setup happens at first sign-in.</span>
              </label>
            </div>
            <fieldset className="subpanel page-stack">
              <legend className="field-heading">Roles</legend>
              <div className="grid-two">
                {roleOptions.map((role, roleIndex) => (
                  <label key={role.value} className="checkbox-row">
                    <input type="checkbox" name={`teamRoles${row}`} value={role.value} defaultChecked={row === 1 ? role.value === 'shift_lead' : roleIndex === 1} />
                    <span><strong>{role.label}</strong></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid-two">
              <label>
                <span className="field-heading">Default workspace</span>
                <select name={`teamWorkspace${row}`} defaultValue={row === 1 ? 'orders' : 'production'}>
                  {workspaceOptions.map((workspace) => (
                    <option key={workspace.value} value={workspace.value}>{workspace.label}</option>
                  ))}
                </select>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" name={`teamEnabled${row}`} defaultChecked />
                <span><strong>Active now</strong></span>
              </label>
            </div>
          </div>
        );
      })}
      {count < 12 ? (
        <button type="button" className="button-secondary compact-button" onClick={() => setCount(Math.min(12, count + 1))}>
          Add team member
        </button>
      ) : null}
    </div>
  );
}
