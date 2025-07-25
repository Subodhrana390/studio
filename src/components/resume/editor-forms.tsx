
"use client";

import React, { useState } from 'react';
import type {
    ResumeContact, ResumeEducation, ResumeExperience, ResumeProject,
    ResumeSkill, ResumeLanguage, ResumeCustomSection, ResumeCustomSectionItem, ResumeData, ResumeResponsibility
} from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Sparkles, Info, FileText, Settings2, Trash2, BookCopy, LanguagesIcon, ListPlus, GripVertical, ArrowUp, ArrowDown
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// AI Flow Imports
import { generateCareerSummary, type CareerSummaryInput } from '@/ai/flows/career-summary-generation';
import { generateExperienceBulletPoints, type GenerateExperienceBulletPointsInput } from '@/ai/flows/experience-bullet-point-generation';
import { suggestSkills, type SuggestSkillsInput } from '@/ai/flows/skill-suggestion-flow';
import { generateProjectDescriptions, type GenerateProjectDescriptionsInput } from '@/ai/flows/project-description-generation';
import { useToast } from '@/hooks/use-toast';

// Props definitions for forms
interface FormProps {
    resume: ResumeData;
    updateField: (field: string, value: any) => void;
}

interface ContactFormProps extends FormProps {
    handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isUploadingPhoto: boolean;
}

interface SkillsFormProps extends FormProps {
    jobDescriptionForAISkills: string;
}

export const ContactForm = ({ resume, updateField, handlePhotoUpload, isUploadingPhoto }: ContactFormProps) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Contact Information</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label htmlFor="name">Full Name</Label><Input id="name" value={resume.contact.name} onChange={e => updateField('contact.name', e.target.value)} placeholder="John Doe" /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={resume.contact.email} onChange={e => updateField('contact.email', e.target.value)} placeholder="john.doe@example.com" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={resume.contact.phone} onChange={e => updateField('contact.phone', e.target.value)} placeholder="(123) 456-7890" /></div>
        <div><Label htmlFor="address">Address</Label><Input id="address" value={resume.contact.address} onChange={e => updateField('contact.address', e.target.value)} placeholder="City, State" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={resume.contact.linkedin} onChange={e => updateField('contact.linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" /></div>
        <div><Label htmlFor="github">GitHub</Label><Input id="github" value={resume.contact.github} onChange={e => updateField('contact.github', e.target.value)} placeholder="github.com/johndoe" /></div>
      </div>
      <div className="grid grid-cols-1">
        <div><Label htmlFor="portfolio">Portfolio/Website</Label><Input id="portfolio" value={resume.contact.portfolio} onChange={e => updateField('contact.portfolio', e.target.value)} placeholder="johndoe.com" /></div>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          {resume.contact.photoUrl && (
            <Avatar className="h-20 w-20">
              <AvatarImage src={resume.contact.photoUrl} alt={resume.contact.name || "User Avatar"} data-ai-hint="person portrait" />
              <AvatarFallback>{resume.contact.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-grow space-y-2">
            <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
            <p className="text-xs text-muted-foreground">
              {isUploadingPhoto ? 'Uploading...' : 'Upload a square image (PNG, JPG, WEBP).'}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SummaryForm = ({ resume, updateField }: FormProps) => {
    const [isLoadingAISummary, setIsLoadingAISummary] = useState(false);
    const { toast } = useToast();

    const generateAISummary = async () => {
        if (!resume) return;
        setIsLoadingAISummary(true);
        try {
            const input: CareerSummaryInput = {
                experienceLevel: 'student', 
                jobTitle: resume.experience[0]?.jobTitle || 'Entry-level role',
                skills: resume.skills.map(s => s.name).join(', '),
                experienceSummary: resume.experience.map(e => `${e.jobTitle} at ${e.company}: ${e.responsibilities.map(r => r.text).join('. ')}`).join('\n'),
            };
            const result = await generateCareerSummary(input);
            if (result.summary) {
                updateField('summary', result.summary);
                toast({ title: "AI Summary Generated!", description: "The summary has been updated." });
            }
        } catch (error) {
            console.error("AI Summary generation failed:", error);
            toast({ title: "Error", description: "Failed to generate AI summary.", variant: "destructive" });
        } finally {
            setIsLoadingAISummary(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />Professional Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={generateAISummary} disabled={isLoadingAISummary}>
                <Sparkles className="mr-2 h-4 w-4" /> {isLoadingAISummary ? 'Generating...' : 'Generate with AI'}
                </Button>
            </div>
            </CardHeader>
            <CardContent>
            <Textarea value={resume.summary} onChange={e => updateField('summary', e.target.value)} placeholder="A brief summary of your skills and career objectives..." rows={5} />
            </CardContent>
        </Card>
    );
};

export const ExperienceForm = ({ resume, updateField }: FormProps) => {
  const [loadingAIForExperienceId, setLoadingAIForExperienceId] = useState<string | null>(null);
  const { toast } = useToast();

  const addExperience = () => {
    const newExp: ResumeExperience = { id: uuidv4(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: [{ id: uuidv4(), text: '' }] };
    updateField('experience', [...resume.experience, newExp]);
  };
  const updateExperience = (index: number, field: keyof ResumeExperience, value: any) => {
    const updatedExp = resume.experience.map((exp: ResumeExperience, i: number) => i === index ? { ...exp, [field]: value } : exp);
    updateField('experience', updatedExp);
  };
  const removeExperience = (index: number) => {
    updateField('experience', resume.experience.filter((_:any, i:number) => i !== index));
  };
  const addResponsibility = (expIndex: number) => {
    const newResp: ResumeResponsibility = { id: uuidv4(), text: '' };
    const updatedExp = resume.experience.map((exp: ResumeExperience, i: number) => i === expIndex ? { ...exp, responsibilities: [...exp.responsibilities, newResp] } : exp);
    updateField('experience', updatedExp);
  };
  const updateResponsibility = (expIndex: number, respIndex: number, value: string) => {
    const updatedExp = resume.experience.map((exp: ResumeExperience, i: number) => 
        i === expIndex 
        ? { ...exp, responsibilities: exp.responsibilities.map((resp, ri) => ri === respIndex ? { ...resp, text: value } : resp) } 
        : exp
    );
    updateField('experience', updatedExp);
  };
  const removeResponsibility = (expIndex: number, respIndex: number) => {
     const updatedExp = resume.experience.map((exp: ResumeExperience, i: number) => i === expIndex ? { ...exp, responsibilities: exp.responsibilities.filter((_, ri) => ri !== respIndex) } : exp);
    updateField('experience', updatedExp);
  };

  const handleGenerateAIBulletPoints = async (expIndex: number) => {
    const currentExperience = resume.experience[expIndex];
    if (!currentExperience.jobTitle || !currentExperience.company) {
        toast({ title: "Missing Information", description: "Please provide a Job Title and Company before generating bullet points.", variant: "destructive" });
        return;
    }
    setLoadingAIForExperienceId(currentExperience.id);
    try {
      const input: GenerateExperienceBulletPointsInput = {
        jobTitle: currentExperience.jobTitle,
        company: currentExperience.company,
        existingResponsibilities: currentExperience.responsibilities.filter(r => r.text.trim() !== '').map(r => r.text),
      };
      const result = await generateExperienceBulletPoints(input);
      if (result.generatedBulletPoints) {
        const newResponsibilities = result.generatedBulletPoints.map(text => ({ id: uuidv4(), text }));
        updateExperience(expIndex, 'responsibilities', newResponsibilities);
        toast({ title: "AI Bullet Points Generated!", description: "Responsibilities have been updated." });
      }
    } catch (error) {
      console.error("AI Bullet Point generation failed:", error);
      toast({ title: "Error", description: "Failed to generate AI bullet points.", variant: "destructive" });
    } finally {
      setLoadingAIForExperienceId(null);
    }
  };


  return (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" />Work Experience</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {resume.experience.map((exp: ResumeExperience, index: number) => (
        <Card key={exp.id} className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Job Title</Label><Input value={exp.jobTitle} onChange={e => updateExperience(index, 'jobTitle', e.target.value)} placeholder="Software Engineer" /></div>
            <div><Label>Company</Label><Input value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} placeholder="Tech Solutions Inc." /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Location</Label><Input value={exp.location} onChange={e => updateExperience(index, 'location', e.target.value)} placeholder="City, State" /></div>
            <div><Label>Start Date</Label><Input type="month" value={exp.startDate} onChange={e => updateExperience(index, 'startDate', e.target.value)} /></div>
           </div>
           <div>
              <Label>End Date</Label>
              <Input type="month" value={exp.endDate} onChange={e => updateExperience(index, 'endDate', e.target.value)} disabled={exp.isCurrent} />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id={`current-${exp.id}`}
                  checked={exp.isCurrent}
                  onCheckedChange={(checked) => {
                    updateExperience(index, 'isCurrent', !!checked);
                  }}
                />
                <Label
                  htmlFor={`current-${exp.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Currently working here
                </Label>
              </div>
            </div>
           
          <div>
            <div className="flex justify-between items-center mb-1">
                <Label>Responsibilities/Achievements</Label>
                <Button variant="outline" size="sm" onClick={() => handleGenerateAIBulletPoints(index)} disabled={loadingAIForExperienceId === exp.id}>
                    <Sparkles className="mr-2 h-4 w-4" /> {loadingAIForExperienceId === exp.id ? 'Generating...' : 'AI Generate'}
                </Button>
            </div>
            {exp.responsibilities.map((resp, respIndex) => (
              <div key={resp.id} className="flex items-center gap-2 mt-1">
                <Textarea value={resp.text} onChange={e => updateResponsibility(index, respIndex, e.target.value)} placeholder="Developed new features..." rows={2}/>
                <Button variant="ghost" size="icon" onClick={() => removeResponsibility(index, respIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addResponsibility(index)} className="mt-2">Add Responsibility</Button>
          </div>
          <Button variant="destructive" size="sm" onClick={() => removeExperience(index)}>Remove Experience</Button>
        </Card>
      ))}
      <Button onClick={addExperience}>Add Experience</Button>
    </CardContent>
  </Card>
  );
};

export const ProjectsForm = ({ resume, updateField }: FormProps) => {
  const [loadingAIForProjectId, setLoadingAIForProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  const addProject = () => {
    const newProj: ResumeProject = { id: uuidv4(), name: '', description: '', technologies: [], link: '', startDate: '', endDate: '' };
    updateField('projects', [...resume.projects, newProj]);
  };
  const updateProject = (index: number, field: keyof ResumeProject, value: any) => {
    const updatedProj = resume.projects.map((proj: ResumeProject, i: number) => i === index ? { ...proj, [field]: value } : proj);
    updateField('projects', updatedProj);
  };
  const removeProject = (index: number) => {
    updateField('projects', resume.projects.filter((_:any, i:number) => i !== index));
  };

  // For handling technologies as tags
  const addTechnology = (projIndex: number, tech: string) => {
    if (tech.trim() === '') return;
    const project = resume.projects[projIndex];
    if (project.technologies.includes(tech.trim())) return;
    const updatedTechnologies = [...project.technologies, tech.trim()];
    updateProject(projIndex, 'technologies', updatedTechnologies);
  };

  const removeTechnology = (projIndex: number, techToRemove: string) => {
    const project = resume.projects[projIndex];
    const updatedTechnologies = project.technologies.filter((t: string) => t !== techToRemove);
    updateProject(projIndex, 'technologies', updatedTechnologies);
  };
  
   const handleGenerateAIDescriptions = async (projIndex: number) => {
    const currentProject = resume.projects[projIndex];
    if (!currentProject.name || currentProject.technologies.length === 0) {
        toast({ title: "Missing Information", description: "Please provide a Project Name and at least one Technology before generating descriptions.", variant: "destructive" });
        return;
    }
    setLoadingAIForProjectId(currentProject.id);
    try {
      const existingDescriptions = currentProject.description.split('\n').filter(d => d.trim() !== '');
      const input: GenerateProjectDescriptionsInput = {
        projectName: currentProject.name,
        technologies: currentProject.technologies,
        existingDescriptions: existingDescriptions,
      };
      const result = await generateProjectDescriptions(input);
      if (result.generatedDescriptions) {
        updateProject(projIndex, 'description', result.generatedDescriptions.join('\n'));
        toast({ title: "AI Descriptions Generated!", description: "Project description has been updated." });
      }
    } catch (error) {
      console.error("AI Project Description generation failed:", error);
      toast({ title: "Error", description: "Failed to generate AI project descriptions.", variant: "destructive" });
    } finally {
      setLoadingAIForProjectId(null);
    }
  };


  return (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><BookCopy className="w-5 h-5 text-primary" />Projects</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {resume.projects.map((proj: ResumeProject, index: number) => (
        <Card key={proj.id} className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Project Name</Label><Input value={proj.name} onChange={e => updateProject(index, 'name', e.target.value)} placeholder="AI Resume Builder" /></div>
            <div><Label>Project Link (Optional)</Label><Input value={proj.link || ''} onChange={e => updateProject(index, 'link', e.target.value)} placeholder="https://github.com/user/repo" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Start Date</Label><Input type="month" value={proj.startDate || ''} onChange={e => updateProject(index, 'startDate', e.target.value)} /></div>
            <div><Label>End Date</Label><Input type="month" value={proj.endDate || ''} onChange={e => updateProject(index, 'endDate', e.target.value)} /></div>
          </div>
          <div>
            <Label>Technologies Used</Label>
            <div className="flex items-center gap-2 mt-1">
                <Input 
                    placeholder="e.g., React, TypeScript" 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTechnology(index, e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }}
                />
            </div>
             <div className="flex flex-wrap gap-2 mt-2">
              {proj.technologies.map((tech) => (
                <div key={tech} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  {tech}
                  <button onClick={() => removeTechnology(index, tech)} className="text-destructive hover:text-destructive/80">&times;</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
                <Label>Description / Bullet Points</Label>
                <Button variant="outline" size="sm" onClick={() => handleGenerateAIDescriptions(index)} disabled={loadingAIForProjectId === proj.id}>
                    <Sparkles className="mr-2 h-4 w-4" /> {loadingAIForProjectId === proj.id ? 'Generating...' : 'AI Optimize'}
                </Button>
            </div>
            <Textarea 
                value={proj.description} 
                onChange={e => updateProject(index, 'description', e.target.value)} 
                placeholder="- Developed a web app using React...&#10;- Implemented user authentication...&#10;- Deployed to Vercel." 
                rows={4}
            />
          </div>
          <Button variant="destructive" size="sm" onClick={() => removeProject(index)}>Remove Project</Button>
        </Card>
      ))}
      <Button onClick={addProject}>Add Project</Button>
    </CardContent>
  </Card>
  );
};

export const EducationForm = ({ resume, updateField }: FormProps) => {
   const addEducation = () => {
    const newEdu: ResumeEducation = { id: uuidv4(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '' };
    updateField('education', [...resume.education, newEdu]);
  };
  const updateEducation = (index: number, field: keyof ResumeEducation, value: any) => {
    const updatedEdu = resume.education.map((edu: ResumeEducation, i: number) => i === index ? { ...edu, [field]: value } : edu);
    updateField('education', updatedEdu);
  };
  const removeEducation = (index: number) => {
    updateField('education', resume.education.filter((_:any, i:number) => i !== index));
  };

  return (
  <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" />Education</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {resume.education.map((edu: ResumeEducation, index: number) => (
        <Card key={edu.id} className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Institution</Label><Input value={edu.institution} onChange={e => updateEducation(index, 'institution', e.target.value)} placeholder="University of Example" /></div>
            <div><Label>Degree</Label><Input value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} placeholder="B.S. Computer Science" /></div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Field of Study</Label><Input value={edu.fieldOfStudy} onChange={e => updateEducation(index, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" /></div>
            <div><Label>GPA (Optional)</Label><Input value={edu.gpa || ''} onChange={e => updateEducation(index, 'gpa', e.target.value)} placeholder="3.8/4.0" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Start Date</Label><Input type="month" value={edu.startDate} onChange={e => updateEducation(index, 'startDate', e.target.value)} /></div>
            <div><Label>End Date / Graduation</Label><Input type="month" value={edu.endDate} onChange={e => updateEducation(index, 'endDate', e.target.value)} /></div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => removeEducation(index)}>Remove Education</Button>
        </Card>
      ))}
      <Button onClick={addEducation}>Add Education</Button>
    </CardContent>
  </Card>
  );
};

export const SkillsForm = ({ resume, updateField, jobDescriptionForAISkills }: SkillsFormProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [isLoadingAISkills, setIsLoadingAISkills] = useState(false);
  const { toast } = useToast();

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skill: ResumeSkill = { id: uuidv4(), name: newSkill.trim(), category: newSkillCategory.trim() || undefined };
    const currentSkills = resume.skills || [];
    if (!currentSkills.some((s: ResumeSkill) => s.name.toLowerCase() === skill.name.toLowerCase())) {
      updateField('skills', [...currentSkills, skill]);
    }
    setNewSkill('');
    setNewSkillCategory('');
  };

  const removeSkill = (id: string) => {
    updateField('skills', resume.skills.filter((s: ResumeSkill) => s.id !== id));
  };

  const handleGenerateAISkills = async () => {
    if (!resume.experience?.[0]?.jobTitle && !jobDescriptionForAISkills) {
       toast({ title: "Missing Information", description: "Please provide a Job Title in experience or a Job Description in ATS tab for AI skill suggestions.", variant: "destructive" });
       return;
    }
    setIsLoadingAISkills(true);
    try {
        const input: SuggestSkillsInput = {
            jobTitle: resume.experience?.[0]?.jobTitle || "Candidate", 
            existingSkills: resume.skills.map((s: ResumeSkill) => s.name),
            jobDescription: jobDescriptionForAISkills || undefined,
        };
        const result = await suggestSkills(input);
        if (result.suggestedSkills && result.suggestedSkills.length > 0) {
            const currentSkills = resume.skills || [];
            const uniqueNewSkills = result.suggestedSkills.filter(
                (suggestedSkill: string) => !currentSkills.some((existingSkill: ResumeSkill) => existingSkill.name.toLowerCase() === suggestedSkill.toLowerCase())
            );
            
            const skillsToAdd: ResumeSkill[] = uniqueNewSkills.map((skillName: string) => ({
                id: uuidv4(),
                name: skillName,
                category: undefined, 
            }));

            if (skillsToAdd.length > 0) {
                 updateField('skills', [...currentSkills, ...skillsToAdd]);
                 toast({ title: "AI Skills Suggested!", description: `${skillsToAdd.length} new skills have been added to your list.` });
            } else {
                 toast({ title: "No New Skills", description: "AI couldn't find any new skills to suggest based on current information." });
            }
        } else {
           toast({ title: "No Skills Suggested", description: "AI did not return any skill suggestions.", variant: "default" });
        }
    } catch (error) {
        console.error("AI Skill suggestion failed:", error);
        toast({ title: "Error", description: "Failed to suggest AI skills.", variant: "destructive" });
    } finally {
        setIsLoadingAISkills(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary"/>Skills</CardTitle>
            <Button variant="outline" size="sm" onClick={handleGenerateAISkills} disabled={isLoadingAISkills}>
                <Sparkles className="mr-2 h-4 w-4" /> {isLoadingAISkills ? 'Suggesting...' : 'AI Suggest Skills'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill (e.g., JavaScript)" />
          <Input value={newSkillCategory} onChange={e => setNewSkillCategory(e.target.value)} placeholder="Category (Optional)" />
          <Button onClick={addSkill}>Add Skill</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {resume.skills.map((skill: ResumeSkill) => (
            <div key={skill.id} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2 text-sm">
              {skill.name} {skill.category && `(${skill.category})`}
              <button onClick={() => removeSkill(skill.id)} className="text-destructive hover:text-destructive/80">&times;</button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const LanguagesForm = ({ resume, updateField }: FormProps) => {
  const addLanguage = () => {
    const newLang: ResumeLanguage = { id: uuidv4(), name: '', proficiency: '' };
    updateField('languages', [...(resume.languages || []), newLang]);
  };

  const updateLanguage = (index: number, field: keyof ResumeLanguage, value: string) => {
    const updatedLangs = (resume.languages || []).map((lang: ResumeLanguage, i: number) => 
      i === index ? { ...lang, [field]: value } : lang
    );
    updateField('languages', updatedLangs);
  };

  const removeLanguage = (index: number) => {
    updateField('languages', (resume.languages || []).filter((_: any, i: number) => i !== index));
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><LanguagesIcon className="w-5 h-5 text-primary"/>Languages</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {(resume.languages || []).map((lang: ResumeLanguage, index: number) => (
          <Card key={lang.id} className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`lang-name-${lang.id}`}>Language</Label>
                <Input id={`lang-name-${lang.id}`} value={lang.name} onChange={e => updateLanguage(index, 'name', e.target.value)} placeholder="e.g., Spanish" />
              </div>
              <div>
                <Label htmlFor={`lang-prof-${lang.id}`}>Proficiency (Optional)</Label>
                <Input id={`lang-prof-${lang.id}`} value={lang.proficiency || ''} onChange={e => updateLanguage(index, 'proficiency', e.target.value)} placeholder="e.g., Fluent, Conversational" />
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => removeLanguage(index)}>Remove Language</Button>
          </Card>
        ))}
        <Button onClick={addLanguage}>Add Language</Button>
      </CardContent>
    </Card>
  );
};

export const CustomSectionsForm = ({ resume, updateField }: FormProps) => {
  const addCustomSection = () => {
    const newSection: ResumeCustomSection = { id: uuidv4(), title: 'New Section', items: [] };
    updateField('customSections', [...(resume.customSections || []), newSection]);
  };

  const updateCustomSectionTitle = (sectionIndex: number, title: string) => {
    const updatedSections = (resume.customSections || []).map((section: ResumeCustomSection, i: number) =>
      i === sectionIndex ? { ...section, title } : section
    );
    updateField('customSections', updatedSections);
  };

  const removeCustomSection = (sectionIndex: number) => {
    updateField('customSections', (resume.customSections || []).filter((_:any, i: number) => i !== sectionIndex));
  };

  const addCustomSectionItem = (sectionIndex: number) => {
    const newItem: ResumeCustomSectionItem = { id: uuidv4(), content: '', subContent: '', date: '' };
    const updatedSections = (resume.customSections || []).map((section: ResumeCustomSection, i: number) =>
      i === sectionIndex ? { ...section, items: [...section.items, newItem] } : section
    );
    updateField('customSections', updatedSections);
  };
  
  const updateCustomSectionItemValue = (sectionIndex: number, itemIndex: number, field: keyof ResumeCustomSectionItem, value: string) => {
    const updatedSections = (resume.customSections || []).map((section: ResumeCustomSection, i: number) =>
      i === sectionIndex ? {
        ...section,
        items: section.items.map((item, j: number) =>
          j === itemIndex ? { ...item, [field]: value } : item
        )
      } : section
    );
    updateField('customSections', updatedSections);
  };

  const removeCustomSectionItem = (sectionIndex: number, itemIndex: number) => {
    const updatedSections = (resume.customSections || []).map((section: ResumeCustomSection, i: number) =>
      i === sectionIndex ? {
        ...section,
        items: section.items.filter((_: any, j: number) => j !== itemIndex)
      } : section
    );
    updateField('customSections', updatedSections);
  };

  const moveCustomSectionItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const sections = [...(resume.customSections || [])];
    const section = sections[sectionIndex];
    if (!section) return;

    const items = [...section.items];
    const item = items[itemIndex];
    if (!item) return;

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

    if (newIndex < 0 || newIndex >= items.length) return; // Invalid move

    items.splice(itemIndex, 1); // Remove item from old position
    items.splice(newIndex, 0, item); // Insert item into new position

    const updatedSections = sections.map((s, i) =>
      i === sectionIndex ? { ...s, items } : s
    );
    updateField('customSections', updatedSections);
  };


  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><ListPlus className="w-5 h-5 text-primary"/>Custom Sections</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {(resume.customSections || []).map((section: ResumeCustomSection, sectionIndex: number) => (
          <Card key={section.id} className="p-4 space-y-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <Input 
                value={section.title} 
                onChange={e => updateCustomSectionTitle(sectionIndex, e.target.value)} 
                placeholder="Section Title (e.g., Achievements, Hobbies)"
                className="text-lg font-semibold flex-grow mr-2"
              />
              <Button variant="destructive" size="sm" onClick={() => removeCustomSection(sectionIndex)}>Remove Section</Button>
            </div>
            {section.items.map((item: ResumeCustomSectionItem, itemIndex: number) => (
              <Card key={item.id} className="p-3 space-y-2">
                 <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center mt-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mb-2" />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCustomSectionItem(sectionIndex, itemIndex, 'up')} disabled={itemIndex === 0}>
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCustomSectionItem(sectionIndex, itemIndex, 'down')} disabled={itemIndex === section.items.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-grow space-y-2">
                        <div>
                        <Label htmlFor={`cs-${section.id}-item-${item.id}-content`}>Content</Label>
                        <Textarea 
                            id={`cs-${section.id}-item-${item.id}-content`}
                            value={item.content} 
                            onChange={e => updateCustomSectionItemValue(sectionIndex, itemIndex, 'content', e.target.value)} 
                            placeholder="e.g., President's List, Photography" 
                            rows={2}
                        />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor={`cs-${section.id}-item-${item.id}-subcontent`}>Sub-content (Optional)</Label>
                            <Input 
                            id={`cs-${section.id}-item-${item.id}-subcontent`}
                            value={item.subContent || ''} 
                            onChange={e => updateCustomSectionItemValue(sectionIndex, itemIndex, 'subContent', e.target.value)} 
                            placeholder="e.g., XYZ University, Street Photography" 
                            />
                        </div>
                        <div>
                            <Label htmlFor={`cs-${section.id}-item-${item.id}-date`}>Date (Optional)</Label>
                            <Input 
                            id={`cs-${section.id}-item-${item.id}-date`}
                            value={item.date || ''} 
                            onChange={e => updateCustomSectionItemValue(sectionIndex, itemIndex, 'date', e.target.value)} 
                            placeholder="e.g., Spring 2023, 2020 - Present" 
                            />
                        </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCustomSectionItem(sectionIndex, itemIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                 </div>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={() => addCustomSectionItem(sectionIndex)}>Add Item to "{section.title}"</Button>
          </Card>
        ))}
        <Button onClick={addCustomSection}>Add Custom Section</Button>
      </CardContent>
    </Card>
  );
};
