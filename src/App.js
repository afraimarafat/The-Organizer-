import React, { useState, useEffect } from 'react';
import './App.css'; // Don't forget to import your CSS!

const EditTaskModal = ({ isOpen, onClose, task, onSave }) => {
    const [editText, setEditText] = useState(task?.text || '');
    const [editDate, setEditDate] = useState(task?.date?.slice(0, 10) || '');
    const [editTime, setEditTime] = useState(task?.date?.length > 10 ? task.date.slice(11, 16) : '');
    const [editFrequency, setEditFrequency] = useState(task?.frequency || 'once');
    const [editEndDate, setEditEndDate] = useState(task?.endDate || ''); // New state for end date
    const [showEndDatePicker, setShowEndDatePicker] = useState(false); // State to control end date picker visibility

    useEffect(() => {
        if (task) {
            setEditText(task.text);
            setEditDate(task.date?.slice(0, 10) || '');
            setEditTime(task.date?.length > 10 ? task.date.slice(11, 16) : '');
            setEditFrequency(task.frequency || 'once');
            setEditEndDate(task.endDate || ''); // Initialize end date
            // Set showEndDatePicker based on whether it's a recurring task AND if an end date already exists
            // If it's recurring but no end date, we want to show the "Set End Date" button initially.
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
                endDate: editFrequency !== 'once' ? editEndDate : '', // Save endDate only for recurring tasks
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
                        // When switching to a recurring frequency, always show the "Set End Date" button initially
                        setShowEndDatePicker(false);
                    }
                }}>
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option> {/* Added Yearly option */}
                </select>

                {isRecurring && (
                    <div className="end-date-section">
                        <label>Ends:</label>
                        {showEndDatePicker ? ( // If true, show date input and clear button
                            <>
                                <input
                                    type="date"
                                    value={editEndDate}
                                    onChange={(e) => setEditEndDate(e.target.value)}
                                />
                                {/* Only show Clear End Date button if a date is actually set */}
                                {editEndDate && (
                                    <button onClick={() => {
                                        setEditEndDate('');
                                        setShowEndDatePicker(false); // Hide picker, show "Set End Date" button
                                    }}>Clear End Date</button>
                                )}
                            </>
                        ) : ( // If false, show "Set End Date" button
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
            setNewNoteContent(''); // Clear input after adding
            toggleNote(newNote.id); //open the note
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
        setOpenNoteIds(openNoteIds.filter((noteId) => noteId !== id)); // Remove from open notes
    };

    // Ensure notes is always treated as an array.
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
    // Helper to format date as-MM-DD in AEST timezone
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

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [taskTime, setTaskTime] = useState('');
    const [frequency, setFrequency] = useState('once');
    const [taskEndDate, setTaskEndDate] = useState(''); // New state for task end date
    const [showTaskEndDatePicker, setShowTaskEndDatePicker] = useState(false); // State to control end date picker visibility
    const [view, setView] = useState('calendar');
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // --- File/Folder Management States ---
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
    const [currentFolder, setCurrentFolder] = useState(null); // null for root, or folder ID
    const [newFolderName, setNewFolderName] = useState('');
    const [fileTitle, setFileTitle] = useState(''); // For file name when uploading
    const [fileDate, setFileDate] = useState(toAESTDateStr(new Date())); // Date associated with the file/folder
    // Removed zoomedImage state as it's for generic files now.

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

    // New states for loading screen
    const [isLoading, setIsLoading] = useState(true);
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false); // New state for fade transition

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // --- File/Folder Management Persistence ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('myFiles', JSON.stringify(files));
        }
    }, [files]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Use an empty array as a default value to ensure notes is always an array
            localStorage.setItem('notes', JSON.stringify(Array.isArray(notes) ? notes : []));
        }
    }, [notes]);

    // Loading screen effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContinueButton(true);
        }, 5000); // Changed to 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        setIsFadingOut(true); // Start fade out animation
        setTimeout(() => {
            setIsLoading(false); // Hide loading screen after fade
        }, 500); // Match CSS transition duration for fade-out
    };

    const addTask = () => {
        if (!input.trim() || !taskDate) return;
        const fullDate = taskTime ? `${taskDate}T${taskTime}` : taskDate;
        setTasks([...tasks, {
            text: input.trim(),
            date: fullDate,
            frequency,
            endDate: frequency !== 'once' ? taskEndDate : '', // Save endDate only for recurring tasks
        }]);
        setInput('');
        setTaskDate('');
        setTaskTime('');
        setFrequency('once');
        setTaskEndDate(''); // Clear end date
        setShowTaskEndDatePicker(false); // Hide end date picker
    };

    const removeTask = (index) => {
        setTasks(prevTasks => prevTasks.filter((_, i) => i !== index));
    };

    const openEditModal = (index) => {
        setTaskToEdit(tasks[index]);
        setEditModalOpen(true);
    };

    const saveEditedTask = (editedTask) => {
        setTasks(prevTasks =>
            prevTasks.map((task) =>
                task === taskToEdit ? editedTask : task
            )
        );
        setTaskToEdit(null);
    };

    // --- File/Folder Management Functions ---
    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        const newFiles = uploadedFiles.map((file, index) => {
            // Get the original file extension
            const fileExtension = file.name.split('.').pop();
            // Determine the final file name: use fileTitle if provided, otherwise original name
            const finalFileName = fileTitle.trim() !== ''
                ? `${fileTitle.trim()}.${fileExtension}`
                : file.name;

            return {
                id: `file-${Date.now()}-${index}`, // Unique ID
                name: finalFileName, // Use the new or original file name here
                type: 'file',
                src: URL.createObjectURL(file), // Create a URL for local preview/download
                date: fileDate, // Use the date from the input
                parentId: currentFolder, // Associate with the current folder
            };
        });

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setFileTitle(''); // Clear file title input after upload
        e.target.value = null; // Clear file input
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
        setNewFolderName(''); // Clear folder name input
    };

    const removeFile = (idToRemove) => {
        // Helper function to get all descendant IDs (including subfolders and files within them)
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
            if (!itemToRemove) return prevFiles; // Item not found

            const idsToDelete = getAllDescendantIds(idToRemove, prevFiles);

            // Revoke object URLs for all files being deleted to free up memory
            idsToDelete.forEach(id => {
                const file = prevFiles.find(item => item.id === id && item.type === 'file');
                if (file && file.src) {
                    URL.revokeObjectURL(file.src);
                }
            });

            // Filter out all items whose IDs are in the idsToDelete list
            return prevFiles.filter(item => !idsToDelete.includes(item.id));
        });
    };


    // Modified tasksByDate to handle recurring tasks across their date range
    const tasksByDate = tasks.reduce((acc, task, i) => {
        const startDate = new Date(task.date);
        const endDate = task.endDate ? new Date(task.endDate) : null;
        const taskWithIndex = { ...task, index: i };

        // Normalize dates to start of day for accurate comparison
        startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(0, 0, 0, 0);

        // If it's a 'once' task, just add it to its specific date
        if (task.frequency === 'once') {
            const dateKey = toAESTDateStr(startDate);
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(taskWithIndex);
        } else {
            // For recurring tasks, iterate through the dates
            let currentDate = new Date(startDate);
            const startDayOfWeek = startDate.getDay(); // 0 for Sunday, 6 for Saturday
            const startDayOfMonth = startDate.getDate();
            const startMonth = startDate.getMonth();

            // If no end date is provided for a recurring task, it only shows on its start date
            if (!endDate) {
                const dateKey = toAESTDateStr(startDate);
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(taskWithIndex);
                return acc; // Move to the next task
            }

            // Loop from start date to end date (inclusive)
            while (currentDate <= endDate) {
                let shouldAddTask = false;

                if (task.frequency === 'daily') {
                    shouldAddTask = true;
                } else if (task.frequency === 'weekly') {
                    if (currentDate.getDay() === startDayOfWeek) {
                        shouldAddTask = true;
                    }
                } else if (task.frequency === 'monthly') {
                    // Handle monthly recurrence, considering months with different day counts
                    const lastDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                    const lastDayOfStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

                    if (currentDate.getDate() === startDayOfMonth ||
                        (startDayOfMonth > lastDayOfCurrentMonth && currentDate.getDate() === lastDayOfCurrentMonth) ||
                        (startDayOfMonth === lastDayOfStartMonth && currentDate.getDate() === lastDayOfCurrentMonth)
                    ) {
                        shouldAddTask = true;
                    }
                } else if (task.frequency === 'yearly') { // Added Yearly recurrence logic
                    if (currentDate.getMonth() === startMonth && currentDate.getDate() === startDayOfMonth) {
                        shouldAddTask = true;
                    }
                }

                if (shouldAddTask) {
                    const dateKey = toAESTDateStr(currentDate);
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(taskWithIndex);
                }

                // Move to the next day
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

    // Filter files/folders for the current view
    const itemsInCurrentFolder = files.filter(item => item.parentId === currentFolder);

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
            ) : (
                <div className="app-container">
                    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </button>

                    <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
                        <button
                            onClick={() => {
                                setView('calendar');
                                setMenuOpen(false);
                            }}
                        >
                            Calendar View
                        </button>
                        <button
                            onClick={() => {
                                setView('files'); // Changed from 'images' to 'files'
                                setMenuOpen(false);
                            }}
                        >
                            My Files
                        </button>
                        <button
                            onClick={() => {
                                setView('allTasks');
                                setMenuOpen(false);
                            }}
                        >
                            My Task Gallery
                        </button>
                        <button
                            onClick={() => {
                                setView('notes');
                                setMenuOpen(false);
                            }}
                        >
                            Notes
                        </button>
                    </div>

                    <div className="main-view">
                        {view === 'calendar' && (
                            <>
                                <h2>
                                    The Organizer 📅 - {selectedDate.toLocaleString('default', { month: 'long' })} {year}
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
                                            // When switching to a recurring frequency, always show the "Set End Date" button initially
                                            setShowTaskEndDatePicker(false);
                                        }
                                    }}>
                                        <option value="once">Once</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option> {/* Added Yearly option */}
                                    </select>

                                    {isAddingRecurring && (
                                        <div className="end-date-section">
                                            <label>Ends:</label>
                                            {showTaskEndDatePicker ? ( // If true, show date input and clear button
                                                <>
                                                    <input
                                                        type="date"
                                                        value={taskEndDate}
                                                        onChange={(e) => setTaskEndDate(e.target.value)}
                                                    />
                                                    {/* Only show Clear End Date button if a date is actually set */}
                                                    {taskEndDate && (
                                                        <button onClick={() => {
                                                            setTaskEndDate('');
                                                            setShowTaskEndDatePicker(false); // Hide picker, show "Set End Date" button
                                                        }}>Clear End Date</button>
                                                    )}
                                                </>
                                            ) : ( // If false, show "Set End Date" button
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

                        {view === 'files' && ( // Changed from 'images' to 'files'
                            <div>
                                <h2>My Files</h2>

                                {/* Breadcrumbs for navigation */}
                                {currentFolder && (
                                    <button className="back-button" onClick={() => setCurrentFolder(null)}>← Back to Root</button>
                                )}

                                {/* Add New Folder Form */}
                                <div className="add-file-form">
                                    <input
                                        type="text"
                                        placeholder="New Folder Name"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                    />
                                    <button onClick={handleCreateFolder}>Create Folder</button>
                                </div>

                                {/* Add New File Form */}
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

                                <div className="file-gallery"> {/* Renamed from image-gallery */}
                                    {itemsInCurrentFolder.length === 0 && <p>No items in this folder.</p>}

                                    {itemsInCurrentFolder.map((item) => (
                                        <div key={item.id} className="file-item"> {/* Renamed from image-item */}
                                            {item.type === 'folder' ? (
                                                <div className="folder-icon" onClick={() => setCurrentFolder(item.id)}>
                                                    📂 {item.name}
                                                    <button className="delete-file-folder-button" onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}>Delete</button>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Display different icons based on file type */}
                                                    {item.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                        <img
                                                            src={item.src}
                                                            alt={item.name}
                                                            style={{ cursor: 'pointer', maxWidth: '100px', borderRadius: '6px' }}
                                                            // No direct zoom for now, user can download
                                                        />
                                                    ) : item.name.match(/\.(pdf)$/i) ? (
                                                        <span className="file-icon">📄</span> // PDF icon
                                                    ) : item.name.match(/\.(doc|docx)$/i) ? (
                                                        <span className="file-icon">📝</span> // Document icon
                                                    ) : item.name.match(/\.(txt)$/i) ? (
                                                        <span className="file-icon">📜</span> // Text file icon
                                                    ) : (
                                                        <span className="file-icon">📦</span> // Generic file icon
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
                    </div>

                    {editModalOpen && (
                        <EditTaskModal
                            isOpen={editModalOpen}
                            onClose={() => setEditModalOpen(false)}
                            task={taskToEdit}
                            onSave={saveEditedTask}
                        />
                    )}
                </div>
            )}
        </>
    );
}
