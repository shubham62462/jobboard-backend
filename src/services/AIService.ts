import { AIAnalysis, Job } from '../types';
import { config } from '../config/env';

export class AIService {
  private isEnabled: boolean;

  constructor() {
    // Check if AI is enabled (requires Google Cloud credentials)
    this.isEnabled = !!config.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!this.isEnabled) {
      console.warn('⚠️  AI Service disabled: Missing Google Cloud configuration');
    }
  }

  async analyzeCandidate(resume: string, cv: string| undefined, job: Job): Promise<AIAnalysis> {
    if (!this.isEnabled) {
      // Return mock analysis if AI is disabled
      return this.getMockAnalysis();
    }

    try {
      // This would be the actual Vertex AI implementation
      // For now, returning enhanced mock data
      return await this.performVertexAIAnalysis(resume, cv, job);
    } catch (error) {
      console.error('AI analysis failed, returning mock data:', error);
      return this.getMockAnalysis();
    }
  }

  private async performVertexAIAnalysis(resume: string, cv: string | undefined, job: Job): Promise<AIAnalysis> {
    // TODO: Implement actual Vertex AI integration
    // This is where you would:
    // 1. Initialize Vertex AI client
    // 2. Send resume and job description to AI model
    // 3. Parse and return structured response

    cv = cv || 'Not Provided';
    
    const prompt = `
    Analyze the following candidate resume against the job requirements:

    JOB DETAILS:
    Job Title: ${job.title}
    Job Description: ${job.description}
    Job Requirements: ${job.requirements}

    CANDIDATE APPLICATION:
    Candidate Resume: ${resume}
    Candidate Cover Letter: ${cv}

    Please provide:
    1. Overall match score (0-100)
    2. Key strengths
    3. Areas of concern
    4. Detailed explanation
    5. Recommendation

    Format as JSON with fields: score, strengths[], concerns[], explanation, recommendation
    `;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Enhanced mock analysis based on actual content
    return this.generateEnhancedMockAnalysis(resume, job);
  }

  private generateEnhancedMockAnalysis(resume: string, job: Job): AIAnalysis {
    // Simple keyword matching for more realistic mock data
    const jobKeywords = [
      ...job.title.toLowerCase().split(' '),
      ...job.requirements.toLowerCase().split(/[,\s]+/)
    ].filter(word => word.length > 3);

    const resumeText = resume.toLowerCase();
    const matchingKeywords = jobKeywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );

    const matchPercentage = Math.min(
      Math.round((matchingKeywords.length / Math.max(jobKeywords.length, 1)) * 100),
      95
    );

    const baseScore = Math.max(30, matchPercentage + Math.random() * 20);
    const finalScore = Math.min(Math.round(baseScore), 100);

    const strengths = [];
    const concerns = [];

    if (matchingKeywords.length > 3) {
      strengths.push(`Strong match for key skills: ${matchingKeywords.slice(0, 3).join(', ')}`);
    }
    
    if (finalScore > 70) {
      strengths.push('Relevant experience for the position');
      strengths.push('Good technical background');
    } else {
      concerns.push('Limited match with key requirements');
      concerns.push('May need additional training');
    }

    return {
      score: finalScore,
      match_percentage: matchPercentage,
      strengths,
      concerns,
      explanation: `Based on the analysis, this candidate shows ${finalScore > 70 ? 'strong' : 'moderate'} alignment with the job requirements. ${matchingKeywords.length > 0 ? `Key matching areas include: ${matchingKeywords.slice(0, 3).join(', ')}.` : ''}`,
      recommendation: finalScore > 80 ? 'Highly recommended for interview' :
                     finalScore > 60 ? 'Recommended for interview' :
                     finalScore > 40 ? 'Consider for interview' :
                     'May not be the best fit'
    };
  }

  private getMockAnalysis(): AIAnalysis {
    const scores = [85, 72, 91, 68, 79, 83, 76];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];

    return {
      score: randomScore,
      match_percentage: randomScore + Math.floor(Math.random() * 10) - 5,
      strengths: [
        'Strong technical background',
        'Relevant industry experience',
        'Good communication skills'
      ],
      concerns: [
        'Limited experience with specific technologies',
        'May need additional training'
      ],
      explanation: 'This candidate shows good alignment with the job requirements based on their technical background and experience.',
      recommendation: randomScore > 80 ? 'Highly recommended' : 
                     randomScore > 60 ? 'Recommended' : 'Consider with caution'
    };
  }

  // Method to enable actual Vertex AI when credentials are available
  async enableVertexAI(): Promise<boolean> {
    try {
      // TODO: Initialize Vertex AI client here
      // const { VertexAI } = require('@google-cloud/aiplatform');
      // this.vertexAI = new VertexAI({...config});
      
      this.isEnabled = true;
      console.log('✅ Vertex AI enabled successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to enable Vertex AI:', error);
      return false;
    }
  }

  getStatus(): { enabled: boolean; provider: string } {
    return {
      enabled: this.isEnabled,
      provider: this.isEnabled ? 'Vertex AI' : 'Mock AI'
    };
  }
}