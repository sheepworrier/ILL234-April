import { describe, it, expect } from 'vitest';
import {
    filterJobs,
    formatPostedDate,
    getUniqueDepartments,
    getUniqueLocations,
    sortByNewest,
} from './jobs';
import type { Job } from '../types/job';

/** Create a job fixture with optional department and location overrides. */
function makeJob(
  slug: string,
  postedDate: string,
  department = 'Technology',
  location = 'Remote',
): Job {
  return {
    slug,
    title: `Role ${slug}`,
    department,
    location,
    type: 'Full-time',
    remote: true,
    postedDate,
    summary: 'A role.',
  };
}

describe('sortByNewest', () => {
  it('orders jobs by posted date, newest first', () => {
    const jobs = [
      makeJob('a', '2027-01-01'),
      makeJob('b', '2027-03-15'),
      makeJob('c', '2027-02-10'),
    ];
    expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
    const original = jobs.map((j) => j.slug);
    sortByNewest(jobs);
    expect(jobs.map((j) => j.slug)).toEqual(original);
  });
});

describe('filterJobs', () => {
  const jobs = [
    makeJob('remote-tech', '2027-01-01', 'Technology', 'Remote'),
    makeJob('onsite-tech', '2027-01-02', 'Technology', 'Boston, MA, USA'),
    makeJob('onsite-finance', '2027-01-03', 'Finance', 'Boston, MA, USA'),
  ];

  it('filters by department or location independently', () => {
    expect(filterJobs(jobs, 'Technology').map((job) => job.slug)).toEqual([
      'remote-tech',
      'onsite-tech',
    ]);
    expect(filterJobs(jobs, '', 'Boston, MA, USA').map((job) => job.slug)).toEqual([
      'onsite-tech',
      'onsite-finance',
    ]);
  });

  it('combines department and location with AND', () => {
    expect(
      filterJobs(jobs, 'Technology', 'Boston, MA, USA').map((job) => job.slug),
    ).toEqual(['onsite-tech']);
    expect(filterJobs(jobs, 'Finance', 'Remote')).toEqual([]);
  });

  it('returns all jobs when both filters are reset', () => {
    expect(filterJobs(jobs).map((job) => job.slug)).toEqual([
      'remote-tech',
      'onsite-tech',
      'onsite-finance',
    ]);
  });
});

describe('job filter options', () => {
  const jobs = [
    makeJob('a', '2027-01-01', 'Technology', 'Remote'),
    makeJob('b', '2027-01-02', 'Finance', 'Boston, MA, USA'),
    makeJob('c', '2027-01-03', 'Technology', 'Boston, MA, USA'),
  ];

  it('returns unique departments in alphabetical order', () => {
    expect(getUniqueDepartments(jobs)).toEqual(['Finance', 'Technology']);
  });

  it('returns unique locations in alphabetical order', () => {
    expect(getUniqueLocations(jobs)).toEqual(['Boston, MA, USA', 'Remote']);
  });
});

describe('formatPostedDate', () => {
  it('formats an ISO date as a readable string', () => {
    expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
  });

  it('returns the raw value when the date is unparseable', () => {
    expect(formatPostedDate('not-a-date')).toBe('not-a-date');
  });
});
