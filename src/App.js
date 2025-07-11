import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import Settings from './Settings';
import { api, supabase } from './utils/supabase';

const EditTaskModal = ({ isOpen, onClose, task, onSave }) => {
   const [editText, setEditText] = useState(task?.text || '');
   const [editDate, setEditDate] = useState(task?.date?.slice(0, 10) || '');
   const [editTime, setEditTime] = useState(task?.date?.length > 10 ? task.date.slice(11, 16) : '');
   const [editFrequency, setEditFrequency] = useState(task?.frequency || 'once');
   const [editEndDate, setEditEndDate] = useState(task?.endDate || '');
   const [showEndDatePicker, setShowEndDatePicker] = useState(false);

   useEffect(() => {
       if (task) {
           setEditText(task.text);
           setEditDate(task.date?.slice(0, 10) || '');
           setEditTime(task.date?.length > 10 ? task.date.slice(11, 16) : '');
           setEditFrequency(task.frequency || 'once');
           setEditEndDate(task.endDate || '');
           setShowEndDatePicker(['daily', 'weekly', 'monthly', 'yearly'].includes(task.frequency) && !!task.endDate);
       }
   }, [task]);

   const handleSave = () => {
       if (editText.trim() && editDate) {
           const newFullDate = editTime ? `${editDate}T${editTime}` : editDate;
           onSave({
               ...task,
               text: editText.trim(),
               date: newFullDate,
               frequency: editFrequency,
               endDate: editFrequency !== 'once' ? editEndDate : '',
           });
           onClose();
       }
   };

   const isRecurring = ['daily', 'weekly', 'monthly', 'yearly'].includes(editFrequency);

   if (!isOpen) return null;

   return (
       <div className="modal-overlay">
           <div className="modal-content">
               <h3>Edit Task</h3>
               <label>Task Name:</label>
               <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} />
               <label>Date (YYYY-MM-DD):</label>
               <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
               <label>Time (HH:MM):</label>
               <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
               <label>Frequency:</label>
               <select value={editFrequency} onChange={(e) => {
                   setEditFrequency(e.target.value);
                   if (e.target.value === 'once') {
                       setEditEndDate('');
                       setShowEndDatePicker(false);
                   } else {
                       setShowEndDatePicker(false);
                   }
               }}>
                   <option value="once">Once</option>
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                   <option value="monthly">Monthly</option>
                   <option value="yearly">Yearly</option>
               </select>

               {isRecurring && (
                   <div className="end-date-section">
                       <label>Ends:</label>
                       {showEndDatePicker ? (
                           <>
                               <input
                                   type="date"
                                   value={editEndDate}
                                   onChange={(e) => setEditEndDate(e.target.value)}
                               />
                               {editEndDate && (
                                   <button onClick={() => {
                                       setEditEndDate('');
                                       setShowEndDatePicker(false);
                                   }}>Clear End Date</button>
                               )}
                           </>
                       ) : (
                           <button onClick={() => setShowEndDatePicker(true)}>Set End Date</button>
                       )}
                       {editEndDate && <p>Ends on: {new Date(editEndDate).toLocaleDateString()}</p>}
                   </div>
               )}

               <div className="modal-buttons">
                   <button onClick={handleSave}>Save</button>
                   <button onClick={onClose}>Cancel</button>
               </div>
           </div>
       </div>
   );
};

const Notes = ({ notes, setNotes }) => {
   const [openNoteIds, setOpenNoteIds] = useState(() => {
       if (typeof window !== 'undefined') {
           const saved = localStorage.getItem('openNoteIds');
           return saved ? JSON.parse(saved) : [];
       }
       return [];
   });
   const [newNoteContent, setNewNoteContent] = useState('');

   useEffect(() => {
       if (typeof window !== 'undefined') {
           localStorage.setItem('openNoteIds', JSON.stringify(openNoteIds));
       }
   }, [openNoteIds]);

   const toggleNote = (id) => {
       setOpenNoteIds((prevIds) =>
           prevIds.includes(id) ? prevIds.filter((noteId) => noteId !== id) : [...prevIds, id]
       );
   };

   const addNote = () => {
       if (newNoteContent.trim() !== '') {
           const newNote = {
               id: Date.now(),
               content: newNoteContent,
           };
           setNotes([...notes, newNote]);
           setNewNoteContent('');
           toggleNote(newNote.id);
       }
   };

   const updateNote = (id, newContent) => {
       const updatedNotes = notes.map((note) =>
           note.id === id ? { ...note, content: newContent } : note
       );
       setNotes(updatedNotes);
   };

   const deleteNote = (id) => {
       const updatedNotes = notes.filter((note) => note.id !== id);
       setNotes(updatedNotes);
       setOpenNoteIds(openNoteIds.filter((noteId) => noteId !== id));
   };

   const notesArray = Array.isArray(notes) ? notes : [];

   return (
       <div className="notes-container">
           <div className="add-note-form">
               <textarea
                   value={newNoteContent}
                   onChange={(e) => setNewNoteContent(e.target.value)}
                   placeholder="Write a new note..."
                   className="new-note-input"
               />
               <button onClick={addNote} className="add-note-button">Add Note</button>
           </div>
           <div className="notes-list">
               {notesArray.map((note) => (
                   <div key={note.id} className="note-card">
                       <div className="note-header">
                           <button
                               className="note-title-button"
                               onClick={() => toggleNote(note.id)}
                           >
                               Note {notesArray.indexOf(note) + 1}
                           </button>
                           <div className="note-actions">
                               <button
                                   className="delete-note-button"
                                   onClick={() => deleteNote(note.id)}>
                                   Delete
                               </button>
                           </div>
                       </div>
                       {openNoteIds.includes(note.id) && (
                           <textarea
                               value={note.content}
                               onChange={(e) => updateNote(note.id, e.target.value)}
                               className="note-content"
                           />
                       )}
                   </div>
               ))}
           </div>
       </div>
   );
};

export default function TodoApp() {
   const [user, setUser] = useState(() => {
       const savedUser = localStorage.getItem('currentUser');
       return savedUser ? JSON.parse(savedUser) : null;
   });
   const [isAuthenticated, setIsAuthenticated] = useState(!!user);
   const [showMainApp, setShowMainApp] = useState(false);

   const toAESTDateStr = (date) => {
       if (!date) return '';
       try {
           return date
               .toLocaleDateString('en-AU', {
                   timeZone: 'Australia/Sydney',
                   year: 'numeric',
                   month: '2-digit',
                   day: '2-digit',
               })
               .split('/')
               .reverse()
               .join('-');
       } catch (error) {
           console.error("Error formatting date", error);
           return '';
       }
   }

   const [tasks, setTasks] = useState([]);
   const [currentUser, setCurrentUser] = useState(null);
   const [input, setInput] = useState('');
   const [taskDate, setTaskDate] = useState('');
   const [taskTime, setTaskTime] = useState('');
   const [frequency, setFrequency] = useState('once');
   const [taskEndDate, setTaskEndDate] = useState('');
   const [showTaskEndDatePicker, setShowTaskEndDatePicker] = useState(false);
   const [view, setView] = useState('calendar');
   const [menuOpen, setMenuOpen] = useState(false);
   const [selectedDate, setSelectedDate] = useState(new Date());

   const [files, setFiles] = useState(() => {
       if (typeof window !== 'undefined') {
           const savedFiles = localStorage.getItem('myFiles');
           try {
               return savedFiles ? JSON.parse(savedFiles) : [];
           } catch (e) {
               console.error("Error parsing saved files: ", e);
               return [];
           }
       }
       return [];
   });
   const [currentFolder, setCurrentFolder] = useState(null);
   const [newFolderName, setNewFolderName] = useState('');
   const [fileTitle, setFileTitle] = useState('');
   const [fileDate, setFileDate] = useState(toAESTDateStr(new Date()));

   const [gotoInput, setGotoInput] = useState('');
   const [editModalOpen, setEditModalOpen] = useState(false);
   const [taskToEdit, setTaskToEdit] = useState(null);
   const [notes, setNotes] = useState(() => {
       if (typeof window !== 'undefined') {
           const savedNotes = localStorage.getItem('notes');
           try {
               return savedNotes ? JSON.parse(savedNotes) : [];
           } catch (e) {
               console.error("Error parsing saved notes: ", e);
               return [];
           }
       }
       return [];
   });

   const [mediaViewer, setMediaViewer] = useState(null);
   const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

   const [isLoading, setIsLoading] = useState(!user);
   const [showContinueButton, setShowContinueButton] = useState(false);
   const [isFadingOut, setIsFadingOut] = useState(false);

   const handleLogin = (userData) => {
       setUser(userData);
       setIsAuthenticated(true);
       setTimeout(() => setShowMainApp(true), 100);
   };

   const handleLogout = async () => {
       await api.signOut();
       localStorage.removeItem('currentUser');
       setUser(null);
       setIsAuthenticated(false);
   };

   const handleUpdateUser = (updatedUser) => {
       setUser(updatedUser);
   };

   useEffect(() => {
       // Check if user is logged in
       supabase.auth.getSession().then(({ data: { session } }) => {
           if (session) {
               setCurrentUser(session.user);
               setIsAuthenticated(true);
               loadTasks();
           }
       });

       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
           if (session) {
               setCurrentUser(session.user);
               setIsAuthenticated(true);
               loadTasks();
           } else {
               setCurrentUser(null);
               setIsAuthenticated(false);
               setTasks([]);
           }
       });

       return () => subscription.unsubscribe();
   }, []);

   const loadTasks = async () => {
       const { data, error } = await api.getTasks();
       if (error) {
           console.error('Failed to load tasks:', error);
       } else {
           setTasks(data || []);
       }
   };

   useEffect(() => {
       if (typeof window !== 'undefined') {
           localStorage.setItem('myFiles', JSON.stringify(files));
       }
   }, [files]);

   useEffect(() => {
       if (typeof window !== 'undefined') {
           localStorage.setItem('notes', JSON.stringify(Array.isArray(notes) ? notes : []));
       }
   }, [notes]);

   useEffect(() => {
       if (isAuthenticated) {
           setIsLoading(false);
           setShowMainApp(true);
       } else {
           const timer = setTimeout(() => {
               setShowContinueButton(true);
           }, 5000);
           return () => clearTimeout(timer);
       }
   }, [isAuthenticated]);

   useEffect(() => {
       if (isAuthenticated && user?.preferences?.darkMode === false) {
           document.body.className = 'light-theme';
       } else if (isAuthenticated && user?.preferences?.darkMode !== false) {
           document.body.className = 'dark-theme';
       } else {
           document.body.className = 'light-theme';
       }
   }, [user?.preferences?.darkMode, isAuthenticated]);

   const handleContinue = () => {
       setIsFadingOut(true);
       setTimeout(() => {
           setIsLoading(false);
       }, 500);
   };

   const addTask = async () => {
       if (!input.trim() || !taskDate) return;
       const fullDate = taskTime ? `${taskDate}T${taskTime}` : taskDate;
       const { data, error } = await api.createTask({
           text: input.trim(),
           date: fullDate,
           frequency,
           end_date: frequency !== 'once' ? taskEndDate : null,
       });
       if (error) {
           console.error('Failed to add task:', error);
       } else {
           setTasks([data, ...tasks]);
           setInput('');
           setTaskDate('');
           setTaskTime('');
           setFrequency('once');
           setTaskEndDate('');
           setShowTaskEndDatePicker(false);
       }
   };

   const removeTask = async (index) => {
       const task = tasks[index];
       const { error } = await api.deleteTask(task.id);
       if (error) {
           console.error('Failed to delete task:', error);
       } else {
           setTasks(prevTasks => prevTasks.filter((_, i) => i !== index));
       }
   };

   const openEditModal = (index) => {
       setTaskToEdit(tasks[index]);
       setEditModalOpen(true);
   };

   const saveEditedTask = async (editedTask) => {
       const { data, error } = await api.updateTask(editedTask.id, {
           text: editedTask.text,
           date: editedTask.date,
           frequency: editedTask.frequency,
           end_date: editedTask.endDate
       });
       if (error) {
           console.error('Failed to update task:', error);
       } else {
           setTasks(prevTasks =>
               prevTasks.map((task) =>
                   task === taskToEdit ? data : task
               )
           );
           setTaskToEdit(null);
       }
   };

   const handleFileUpload = (e) => {
       const uploadedFiles = Array.from(e.target.files);
       const newFiles = uploadedFiles.map((file, index) => {
           const fileExtension = file.name.split('.').pop();
           const finalFileName = fileTitle.trim() !== ''
               ? `${fileTitle.trim()}.${fileExtension}`
               : file.name;

           return {
               id: `file-${Date.now()}-${index}`,
               name: finalFileName,
               type: 'file',
               src: URL.createObjectURL(file),
               date: fileDate,
               parentId: currentFolder,
           };
       });

       setFiles((prevFiles) => [...prevFiles, ...newFiles]);
       setFileTitle('');
       e.target.value = null;
   };

   const handleCreateFolder = () => {
       if (!newFolderName.trim()) return;

       const newFolder = {
           id: `folder-${Date.now()}`,
           name: newFolderName.trim(),
           type: 'folder',
           parentId: currentFolder,
       };

       setFiles((prevFiles) => [...prevFiles, newFolder]);
       setNewFolderName('');
   };

   const removeFile = (idToRemove) => {
       const getAllDescendantIds = (targetId, allItems) => {
           let ids = [targetId];
           const children = allItems.filter(item => item.parentId === targetId);
           children.forEach(child => {
               if (child.type === 'folder') {
                   ids = ids.concat(getAllDescendantIds(child.id, allItems));
               } else {
                   ids.push(child.id);
               }
           });
           return ids;
       };

       setFiles(prevFiles => {
           const itemToRemove = prevFiles.find(item => item.id === idToRemove);
           if (!itemToRemove) return prevFiles;

           const idsToDelete = getAllDescendantIds(idToRemove, prevFiles);

           idsToDelete.forEach(id => {
               const file = prevFiles.find(item => item.id === id && item.type === 'file');
               if (file && file.src) {
                   URL.revokeObjectURL(file.src);
               }
           });

           return prevFiles.filter(item => !idsToDelete.includes(item.id));
       });
   };

   const tasksByDate = tasks.reduce((acc, task, i) => {
       const startDate = new Date(task.date);
       const endDate = task.endDate ? new Date(task.endDate) : null;
       const taskWithIndex = { ...task, index: i };

       startDate.setHours(0, 0, 0, 0);
       if (endDate) endDate.setHours(0, 0, 0, 0);

       if (task.frequency === 'once') {
           const dateKey = toAESTDateStr(startDate);
           if (!acc[dateKey]) acc[dateKey] = [];
           acc[dateKey].push(taskWithIndex);
       } else {
           let currentDate = new Date(startDate);
           const startDayOfWeek = startDate.getDay();
           const startDayOfMonth = startDate.getDate();
           const startMonth = startDate.getMonth();

           if (!endDate) {
               const dateKey = toAESTDateStr(startDate);
               if (!acc[dateKey]) acc[dateKey] = [];
               acc[dateKey].push(taskWithIndex);
               return acc;
           }

           while (currentDate <= endDate) {
               let shouldAddTask = false;

               if (task.frequency === 'daily') {
                   shouldAddTask = true;
               } else if (task.frequency === 'weekly') {
                   if (currentDate.getDay() === startDayOfWeek) {
                       shouldAddTask = true;
                   }
               } else if (task.frequency === 'monthly') {
                   const lastDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                   const lastDayOfStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

                   if (currentDate.getDate() === startDayOfMonth ||
                       (startDayOfMonth > lastDayOfCurrentMonth && currentDate.getDate() === lastDayOfCurrentMonth) ||
                       (startDayOfMonth === lastDayOfStartMonth && currentDate.getDate() === lastDayOfCurrentMonth)
                   ) {
                       shouldAddTask = true;
                   }
               } else if (task.frequency === 'yearly') {
                   if (currentDate.getMonth() === startMonth && currentDate.getDate() === startDayOfMonth) {
                       shouldAddTask = true;
                   }
               }

               if (shouldAddTask) {
                   const dateKey = toAESTDateStr(currentDate);
                   if (!acc[dateKey]) acc[dateKey] = [];
                   acc[dateKey].push(taskWithIndex);
               }

               currentDate.setDate(currentDate.getDate() + 1);
           }
       }
       return acc;
   }, {});

   const year = selectedDate.getFullYear();
   const month = selectedDate.getMonth();

   const firstDayOfMonth = new Date(year, month, 1).getDay();
   const daysInMonth = new Date(year, month + 1, 0).getDate();

   const calendarDays = [];
   for (let i = 0; i < 35; i++) {
       const dayNum = i - firstDayOfMonth + 1;
       calendarDays.push(dayNum < 1 || dayNum > daysInMonth ? null : new Date(year, month, dayNum));
   }

   const today = toAESTDateStr(new Date());

   const changeMonth = (offset) => {
       const newDate = new Date(selectedDate);
       newDate.setMonth(newDate.getMonth() + offset);
       setSelectedDate(newDate);
   };

   const handleGoto = () => {
       if (!gotoInput) return;
       const newDate = new Date(gotoInput);
       if (!isNaN(newDate)) setSelectedDate(newDate);
       setGotoInput('');
   };

   const isAddingRecurring = ['daily', 'weekly', 'monthly', 'yearly'].includes(frequency);
   const itemsInCurrentFolder = files.filter(item => item.parentId === currentFolder);
   const mediaItems = itemsInCurrentFolder.filter(item => 
       item.type === 'file' && item.name.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg|mov)$/i)
   );

   const openMediaViewer = (item) => {
       const index = mediaItems.findIndex(media => media.id === item.id);
       setCurrentMediaIndex(index);
       setMediaViewer(mediaItems);
   };

   const closeMediaViewer = () => {
       setMediaViewer(null);
   };

   const nextMedia = () => {
       setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
   };

   const prevMedia = () => {
       setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
   };



   return (
       <>
           {isLoading ? (
               <div className={`loading-screen ${isFadingOut ? 'fade-out' : ''}`}>
                   <h1 className="loading-text">"What are you doing today?"</h1>
                   {showContinueButton && (
                       <button className="continue-button" onClick={handleContinue}>
                           Continue
                       </button>
                   )}
               </div>
           ) : !isAuthenticated ? (
               <Auth onLogin={handleLogin} />
           ) : (
               <div className={`app-container ${showMainApp ? 'fade-in' : ''}`}>
                   <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                       ☰
                   </button>

                   <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
                       <button onClick={() => { setView('calendar'); setMenuOpen(false); }}>
                           Calendar View
                       </button>
                       <button onClick={() => { setView('files'); setMenuOpen(false); }}>
                           My Files
                       </button>
                       <button onClick={() => { setView('allTasks'); setMenuOpen(false); }}>
                           My Task Gallery
                       </button>
                       <button onClick={() => { setView('notes'); setMenuOpen(false); }}>
                           Notes
                       </button>
                       <button onClick={() => { setView('settings'); setMenuOpen(false); }}>
                           Settings
                       </button>
                       <button onClick={handleLogout} className="logout-button">
                           Logout
                       </button>
                   </div>

                   <div className="main-view">
                       {view === 'calendar' && (
                           <>
                               <h2>
                                   The Organizer 📅 (beta) - {selectedDate.toLocaleString('default', { month: 'long' })} {year}
                               </h2>

                               <div className="add-task-form">
                                   <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Task" />
                                   <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
                                   <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} />
                                   <select value={frequency} onChange={(e) => {
                                       setFrequency(e.target.value);
                                       if (e.target.value === 'once') {
                                           setTaskEndDate('');
                                           setShowTaskEndDatePicker(false);
                                       } else {
                                           setShowTaskEndDatePicker(false);
                                       }
                                   }}>
                                       <option value="once">Once</option>
                                       <option value="daily">Daily</option>
                                       <option value="weekly">Weekly</option>
                                       <option value="monthly">Monthly</option>
                                       <option value="yearly">Yearly</option>
                                   </select>

                                   {isAddingRecurring && (
                                       <div className="end-date-section">
                                           <label>Ends:</label>
                                           {showTaskEndDatePicker ? (
                                               <>
                                                   <input
                                                       type="date"
                                                       value={taskEndDate}
                                                       onChange={(e) => setTaskEndDate(e.target.value)}
                                                   />
                                                   {taskEndDate && (
                                                       <button onClick={() => {
                                                           setTaskEndDate('');
                                                           setShowTaskEndDatePicker(false);
                                                       }}>Clear End Date</button>
                                                   )}
                                               </>
                                           ) : (
                                               <button onClick={() => setShowTaskEndDatePicker(true)}>Set End Date</button>
                                           )}
                                           {taskEndDate && <p>Ends on: {new Date(taskEndDate).toLocaleDateString()}</p>}
                                       </div>
                                   )}

                                   <button onClick={addTask}>Add</button>
                               </div>

                               <div className="nav-buttons">
                                   <button onClick={() => setSelectedDate(new Date())}>Go to Today</button>
                                   <input type="date" value={gotoInput} onChange={(e) => setGotoInput(e.target.value)} />
                                   <button onClick={handleGoto}>Go to Date</button>
                                   <button onClick={() => changeMonth(-1)}>Prev Month</button>
                                   <button onClick={() => changeMonth(1)}>Next Month</button>
                               </div>

                               <div className="calendar-grid">
                                   {calendarDays.map((day, index) => {
                                       if (!day) return <div key={index} className="calendar-cell empty"></div>;

                                       const formatted = toAESTDateStr(day);
                                       const tasksForDay = tasksByDate[formatted] || [];

                                       return (
                                           <div
                                               key={index}
                                               className={`calendar-cell ${formatted === today ? 'today' : ''
                                                   } ${formatted === toAESTDateStr(selectedDate) ? 'selected' : ''}`}
                                           >
                                               <strong>{day.getDate()}</strong>

                                               {tasksForDay.length > 3 ? (
                                                   <details>
                                                       <summary>{tasksForDay.length} tasks</summary>
                                                       {tasksForDay.map((task) => (
                                                           <div key={task.index} className="task-entry">
                                                               {task.text} {task.frequency && `(${task.frequency})`}
                                                               {task.endDate && ` (Ends: ${new Date(task.endDate).toLocaleDateString()})`}
                                                               <div className="task-actions">
                                                                   <button onClick={() => openEditModal(task.index)}>Edit</button>
                                                                   <button onClick={() => removeTask(task.index)}>Delete</button>
                                                               </div>
                                                           </div>
                                                       ))}
                                                   </details>
                                               ) : (
                                                   tasksForDay.map((task) => (
                                                       <div key={task.index} className="task-entry">
                                                           {task.text} {task.frequency && `(${task.frequency})`}
                                                           {task.endDate && ` (Ends: ${new Date(task.endDate).toLocaleDateString()})`}
                                                           <div className="task-actions">
                                                               <button onClick={() => openEditModal(task.index)}>Edit</button>
                                                               <button onClick={() => removeTask(task.index)}>Delete</button>
                                                           </div>
                                                       </div>
                                                   ))
                                               )}
                                           </div>
                                       );
                                   })}
                               </div>
                           </>
                       )}

                       {view === 'files' && (
                           <div>
                               <h2>My Files</h2>

                               {currentFolder && (
                                   <button className="back-button" onClick={() => setCurrentFolder(null)}>← Back to Root</button>
                               )}

                               <div className="add-file-form">
                                   <input
                                       type="text"
                                       placeholder="New Folder Name"
                                       value={newFolderName}
                                       onChange={(e) => setNewFolderName(e.target.value)}
                                   />
                                   <button onClick={handleCreateFolder}>Create Folder</button>
                               </div>

                               <div className="add-file-form">
                                   <input
                                       type="text"
                                       placeholder="File Title (Optional)"
                                       value={fileTitle}
                                       onChange={(e) => setFileTitle(e.target.value)}
                                   />
                                   <input
                                       type="date"
                                       value={fileDate}
                                       onChange={(e) => setFileDate(e.target.value)}
                                       max={toAESTDateStr(new Date())}
                                   />
                                   <input type="file" multiple onChange={handleFileUpload} />
                               </div>

                               <div className="file-gallery">
                                   {itemsInCurrentFolder.length === 0 && <p>No items in this folder.</p>}

                                   {itemsInCurrentFolder.map((item) => (
                                       <div key={item.id} className="file-item">
                                           {item.type === 'folder' ? (
                                               <div className="folder-icon" onClick={() => setCurrentFolder(item.id)}>
                                                   📂 {item.name}
                                                   <button className="delete-file-folder-button" onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}>Delete</button>
                                               </div>
                                           ) : (
                                               <>
                                                   {item.name.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg|mov)$/i) ? (
                                                       <div 
                                                           style={{ cursor: 'pointer' }}
                                                           onClick={() => openMediaViewer(item)}
                                                       >
                                                           {item.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                               <img
                                                                   src={item.src}
                                                                   alt={item.name}
                                                                   style={{ maxWidth: '100px', borderRadius: '6px' }}
                                                               />
                                                           ) : (
                                                               <div className="video-preview">
                                                                   <span className="file-icon">🎥</span>
                                                                   <p>Click to preview</p>
                                                               </div>
                                                           )}
                                                       </div>
                                                   ) : item.name.match(/\.(pdf)$/i) ? (
                                                       <span className="file-icon">📄</span>
                                                   ) : item.name.match(/\.(doc|docx)$/i) ? (
                                                       <span className="file-icon">📝</span>
                                                   ) : item.name.match(/\.(txt)$/i) ? (
                                                       <span className="file-icon">📜</span>
                                                   ) : (
                                                       <span className="file-icon">📦</span>
                                                   )}
                                                   <div className="file-info">
                                                       <strong>{item.name}</strong>
                                                       <br />
                                                       <em>{item.date}</em>
                                                       <br />
                                                       <a href={item.src} download={item.name} className="download-button">Download</a>
                                                       <button onClick={() => removeFile(item.id)}>Delete</button>
                                                   </div>
                                               </>
                                           )}
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}

                       {view === 'allTasks' && (
                           <div>
                               <h2>My Task Gallery</h2>
                               <div className="task-gallery">
                                   {tasks.length === 0 && <p>No tasks added yet.</p>}
                                   {tasks.map((task, index) => (
                                       <div key={index} className="task-entry">
                                           <div>
                                               <strong>{task.text}</strong> -{' '}
                                               {new Date(task.date).toLocaleDateString()}
                                               {task.date.length > 10 && ` at ${new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                               {task.frequency !== 'once' && ` (${task.frequency})`}
                                               {task.endDate && ` (Ends: ${new Date(task.endDate).toLocaleDateString()})`}
                                           </div>
                                           <div className="task-actions">
                                               <button onClick={() => openEditModal(index)}>Edit</button>
                                               <button onClick={() => removeTask(index)}>Delete</button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}

                       {view === 'notes' && (
                           <Notes notes={notes} setNotes={setNotes} />
                       )}

                       {view === 'settings' && (
                           <Settings 
                               user={user} 
                               onUpdateUser={handleUpdateUser}
                               onLogout={handleLogout}
                           />
                       )}
                   </div>

                   {editModalOpen && (
                       <EditTaskModal
                           isOpen={editModalOpen}
                           onClose={() => setEditModalOpen(false)}
                           task={taskToEdit}
                           onSave={saveEditedTask}
                       />
                   )}
                   {mediaViewer && (
                       <div className="media-viewer-overlay" onClick={closeMediaViewer}>
                           <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
                               <button className="media-close" onClick={closeMediaViewer}>×</button>
                               
                               {mediaViewer.length > 1 && (
                                   <>
                                       <button className="media-nav media-prev" onClick={prevMedia}>‹</button>
                                       <button className="media-nav media-next" onClick={nextMedia}>›</button>
                                   </>
                               )}
                               
                               {mediaViewer[currentMediaIndex]?.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                   <img 
                                       src={mediaViewer[currentMediaIndex].src} 
                                       alt={mediaViewer[currentMediaIndex].name}
                                       className="media-content"
                                   />
                               ) : (
                                   <video 
                                       src={mediaViewer[currentMediaIndex]?.src} 
                                       controls 
                                       className="media-content"
                                   />
                               )}
                               
                               <div className="media-info">
                                   {mediaViewer.length > 1 && (
                                       <span className="media-counter">
                                           {currentMediaIndex + 1} / {mediaViewer.length}
                                       </span>
                                   )}
                                   <span className="media-name">{mediaViewer[currentMediaIndex]?.name}</span>
                               </div>
                           </div>
                       </div>
                   )}
               </div>
           )}
       </>
   );
}