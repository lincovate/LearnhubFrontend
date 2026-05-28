// CourseLeaderboard.jsx (updated)
import React, { useState, useEffect } from 'react';
import { examsApi } from '../../api/exams';
import { useAuth } from '../../contexts/AuthContext';
import './CourseLeaderboard.css';

const CourseLeaderboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const res = await examsApi.getMyCourses();
      const coursesData = res.data.results || res.data || [];
      setCourses(coursesData);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    if (courseId) {
      setLoading(true);
      try {
        const res = await examsApi.getCourseLeaderboard(courseId);
        setLeaderboard(res.data);
      } catch (err) {
        console.error(err);
        setLeaderboard(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLeaderboard(null);
    }
  };

  if (!user) return <div className="course-leaderboard course-leaderboard--loading">Loading...</div>;
  if (coursesLoading) return <div className="course-leaderboard course-leaderboard--loading">Loading courses...</div>;

  return (
    <div className="course-leaderboard">
      <h1 className="course-leaderboard__title">Course Leaderboard</h1>
      <select
        value={selectedCourse}
        onChange={handleCourseChange}
        className="course-leaderboard__select"
      >
        <option value="">Select a course</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.code} - {course.name}
          </option>
        ))}
      </select>

      {loading && <p className="course-leaderboard__loading">Loading leaderboard...</p>}
      {leaderboard && (
        <div className="course-leaderboard__content">
          <h2 className="course-leaderboard__subtitle">{leaderboard.course} ({leaderboard.course_code})</h2>
          <div className="course-leaderboard__table-wrapper">
            <table className="course-leaderboard__table">
              <thead>
                <tr>
                  <th className="course-leaderboard__th">Rank</th>
                  <th className="course-leaderboard__th">Student Name</th>
                  <th className="course-leaderboard__th">Reg No</th>
                  <th className="course-leaderboard__th">Average %</th>
                  <th className="course-leaderboard__th">Exams Taken</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.ranking.map(entry => (
                  <tr key={entry.student_id} className="course-leaderboard__tr">
                    <td className="course-leaderboard__td">{entry.rank}</td>
                    <td className="course-leaderboard__td">{entry.student_name}</td>
                    <td className="course-leaderboard__td">{entry.registration_number}</td>
                    <td className="course-leaderboard__td">{entry.avg_percentage}%</td>
                    <td className="course-leaderboard__td">{entry.exams_taken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLeaderboard;