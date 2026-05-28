import React, { useState, useEffect } from 'react';
import { examsApi } from '../../api/exams';
import { useAuth } from '../../contexts/AuthContext';
import './StudentCourseLeaderboard.css';

const StudentCourseLeaderboard = () => {
  const { user } = useAuth();
  const [courseLeaderboards, setCourseLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadLeaderboards();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesRes = await examsApi.getMyCourses();
      const courses = coursesRes.data.results || coursesRes.data || [];

      if (courses.length === 0) {
        setCourseLeaderboards([]);
        setLoading(false);
        return;
      }

      const leaderboardPromises = courses.map(course =>
        examsApi.getCourseLeaderboard(course.id)
          .then(res => ({ course, leaderboard: res.data, error: null }))
          .catch(err => ({ course, leaderboard: null, error: err.response?.data?.error || err.message }))
      );

      const results = await Promise.all(leaderboardPromises);
      setCourseLeaderboards(results);
    } catch (err) {
      console.error(err);
      setError('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="student-course-leaderboard student-course-leaderboard--loading">Loading...</div>;
  if (error) return <div className="student-course-leaderboard student-course-leaderboard--error">{error}</div>;

  return (
    <div className="student-course-leaderboard">
      <h1 className="student-course-leaderboard__title">My Course Leaderboards</h1>
      {courseLeaderboards.length === 0 ? (
        <p className="student-course-leaderboard__empty">You are not enrolled in any courses.</p>
      ) : (
        courseLeaderboards.map(({ course, leaderboard, error: courseError }) => (
          <div key={course.id} className="student-course-leaderboard__section">
            <h2 className="student-course-leaderboard__section-title">
              {course.name} ({course.code})
            </h2>
            {courseError ? (
              <p className="student-course-leaderboard__section-error">Failed to load leaderboard: {courseError}</p>
            ) : leaderboard && leaderboard.ranking && leaderboard.ranking.length > 0 ? (
              <table className="student-course-leaderboard__table">
                <thead>
                  <tr>
                    <th className="student-course-leaderboard__th">Rank</th>
                    <th className="student-course-leaderboard__th">Student Name</th>
                    <th className="student-course-leaderboard__th">Registration No</th>
                    <th className="student-course-leaderboard__th">Average %</th>
                    <th className="student-course-leaderboard__th">Exams Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.ranking.map(entry => (
                    <tr key={entry.student_id} className="student-course-leaderboard__tr">
                      <td className="student-course-leaderboard__td">{entry.rank}</td>
                      <td className="student-course-leaderboard__td">{entry.student_name}</td>
                      <td className="student-course-leaderboard__td">{entry.registration_number}</td>
                      <td className="student-course-leaderboard__td">{entry.avg_percentage}%</td>
                      <td className="student-course-leaderboard__td">{entry.exams_taken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="student-course-leaderboard__section-empty">No exam submissions for this course yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default StudentCourseLeaderboard;