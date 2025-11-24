import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiCallService } from 'src/app/core/services/api-call-service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ResponseVM } from 'src/app/core/interfaces/api.interface';
import { ResponseCode } from 'src/app/core/consts/api.consts';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

export interface Recording {
  id: number;
  fileName: string;
  fileSizeFormatted: string;
  durationFormatted: string;
  transcriptionStatus: string;
  fileUrl: string;
  totalRecords?: number;
  selected?: boolean;
}

export interface Analysis {
  fileName: string;
  aiModelUsed: string;
  modelName: string;
  transcript: string;
  sentiment: string;
  summary: string;
  keywords: string[];
  confidenceScore: number;
  analyzedOn: string;
  emotions: string[];
}

export interface AnalysisResult {
  recordingId: number;
  status: string;
  analysis: Analysis;
}

@Component({
  selector: 'app-call-analysis',
  templateUrl: './call-analysis.component.html',
  styleUrls: ['./call-analysis.component.scss'],
  standalone: false
})
export class CallAnalysisComponent implements OnInit {
  private readonly _api = inject(ApiCallService);
  private readonly _toaster = inject(ToastService);
  private readonly _modalService = inject(NgbModal);
  private modalRef!: NgbModalRef;
  analysisForms!: FormArray;
  analysisResults: AnalysisResult[] = [];
  @ViewChild('AnalysisModal') AnalysisModal!: TemplateRef<any>;
  keywords: string[] = [];
  emotions: string[] = [];

  recordings: Recording[] = [];
  selectedRecordings: number[] = [];
  selectedRecording: Recording | null = null;
  recordingToDelete: Recording | null = null;

  selectedAIModel: string = "";
  selectedModelName: string = "";
  // analysisResult: any;

  // AI Models
  AiModels = [
    {
      AIModel: 'Meta',
      image: 'assets/images/ai-models/meta-logo.svg',
      // Paid: [
      //   { id: 1, modelName: '', backendKey: '' },
      //   { id: 2, modelName: '', backendKey: '' }
      // ],
      Free: [
        { id: 1, modelName: 'llama-3.1-8b-instant', backendKey: 'fast' },
        { id: 2, modelName: 'llama-3.3-70b-versatile', backendKey: 'powerful' },
        { id: 2, modelName: 'meta-llama/llama-4-scout-17b-16e-instruct', backendKey: 'latest' }
      ]
    },
    {
      AIModel: 'OpenAi',
      image: 'assets/images/ai-models/oa-basic.svg',
      Paid: [
        { id: 1, modelName: 'o3', backendKey: 'o3' },
        { id: 2, modelName: 'o3-pro', backendKey: 'o3-pro' },
        { id: 3, modelName: 'gpt-4.0', backendKey: 'gpt-4.0' },
        { id: 4, modelName: 'gpt-4.1', backendKey: 'gpt-4.1' },
        { id: 5, modelName: 'gpt-4.5', backendKey: 'gpt-4.5' },
        { id: 6, modelName: 'gpt-5', backendKey: 'gpt-5' }
      ],
      Free: [
        { id: 1, modelName: 'gpt-4o-mini', backendKey: 'gpt-4o-mini' },
        { id: 2, modelName: 'gpt-4.1-mini', backendKey: 'gpt-4.1-mini' },
        { id: 3, modelName: 'gpt-4.1-nano', backendKey: 'gpt-4.1-nano' },
        { id: 4, modelName: 'o3-mini', backendKey: 'o3-mini' },
        { id: 5, modelName: 'o4-mini', backendKey: 'o4-mini' }
      ]
    },
    {
      AIModel: 'Gemini',
      image: 'assets/images/ai-models/gemini.svg',
      Paid: [
        { id: 1, modelName: 'gemini-2.5-pro', backendKey: 'pro2.5' },
        { id: 2, modelName: 'gemini-2.5-flash', backendKey: 'flash2.5' }
      ],
      Free: [
        { id: 1, modelName: 'gemini-2.5-flash-lite', backendKey: 'flash2.5lite' },
        { id: 2, modelName: 'gemini-2.0-flash', backendKey: 'flash2.0' }
      ]
    },
    {
      AIModel: 'DeepSeek',
      image: 'assets/images/ai-models/deepseek_logo.png',
      // Paid: [
      //   { id: 1, modelName: '', backendKey: '' },
      //   { id: 2, modelName: '', backendKey: '' }
      // ],
      Free: [
        { id: 1, modelName: 'deepseek/deepseek-r1', backendKey: 'r1' },
        { id: 2, modelName: 'deepseek/deepseek-chat', backendKey: 'v3' }
      ]
    }
  ];




  // Add with your other properties
  showFilters: boolean = false;
  searchText: string = "";
  searchTerm: string = "";

  // Upload & Edit State
  selectedFiles: File[] = [];
  editFile: File | null = null;
  isDragOver = false;
  isEditMode = false;

  // Pagination
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.analysisForms = this.fb.array([]);
    this.fetchRecordingsData();
  }

  private fetchRecordingsData() {
    const payload = {
      search: this.searchTerm,
      fromDate: null,
      toDate: null,
      isDeleted: false,
      sortBy: null,
      sortOrder: null,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this._api.PostCall(payload, "Recordings/GetAllCalls")
      .subscribe((res: ResponseVM) => {
        if (res.responseCode === ResponseCode.Success) {
          this.recordings = res.data.records;
          this.totalPages = res.data.pagination.totalPages;
          this.totalRecords = res.data.pagination.totalRecords;
        } else {
          this.recordings = [];
          this.totalPages = 0;
          this.totalRecords = 0;
          this._toaster.error(res.errorMessage);
        }
      });
  }

  // Add Modal
  openAddRecordingModal(content: any) {
    this.isEditMode = false;
    this.selectedFiles = [];
    this.editFile = null;
    this.modalRef = this._modalService.open(content, { size: 'lg' });

    this.modalRef.result.finally(() => {
      this.resetModalState();
    });
  }

  // Edit Modal
  openEditRecordingModal(content: any, rec: Recording) {
    this.isEditMode = true;
    this.selectedRecording = rec;
    this.selectedFiles = [];
    this.editFile = null;
    this.modalRef = this._modalService.open(content, { size: 'lg' });

    this.modalRef.result.finally(() => {
      this.resetModalState();
    });
  }


  //  View Modal
  openViewRecordingModal(content: any, rec: Recording) {
    this.selectedRecording = rec;
    this.modalRef = this._modalService.open(content, { size: 'md' });
  }

  //  Delete Modal
  openDeleteRecordingModal(content: any, rec: Recording) {
    this.recordingToDelete = rec;
    this.modalRef = this._modalService.open(content, { centered: true });
  }

  //  Upload New Recordings
  uploadFiles(modal: NgbModalRef) {
    if (this.selectedFiles.length === 0) {
      this._toaster.error("No files to upload!", 2000);
      return;
    }

    const formData = new FormData();
    formData.append("ClientId", "123");
    formData.append("UploadedBy", "Hamad");

    this.selectedFiles.forEach(file => {
      formData.append("Files", file, file.name);
    });

    this._api.PostFormDataWithToken(formData, "Recordings/upload")
      .subscribe((res: ResponseVM) => {
        if (res.responseCode === ResponseCode.Success) {
          this._toaster.success(res.responseMessage);
          this.fetchRecordingsData();
          this.selectedFiles = [];
          modal.close();
        } else {
          this._toaster.error(res.errorMessage);
        }
      });
  }

  //  Update Existing Recording
  updateFile(modal: NgbModalRef) {
    if (!this.editFile || !this.selectedRecording) {
      this._toaster.error("No file selected!", 2000);
      return;
    }

    const formData = new FormData();
    formData.append("Id", this.selectedRecording.id.toString());
    formData.append("NewFile", this.editFile, this.editFile.name);

    this._api.PostFormDataWithToken(formData, "Recordings/update")
      .subscribe((res: ResponseVM) => {
        if (res.responseCode === ResponseCode.Success) {
          this._toaster.success(res.responseMessage);
          this.fetchRecordingsData();
          modal.close();
        } else {
          this._toaster.error(res.errorMessage);
        }
      });
  }

  //  Delete Recording
  deleteRecording(modal: NgbModalRef) {
    if (!this.recordingToDelete) return;

    this._api.DeleteCall(`Recordings/delete/${this.recordingToDelete.id}`)
      .subscribe((res: ResponseVM) => {
        if (res.responseCode === ResponseCode.Success) {
          this._toaster.success(res.responseMessage);
          this.fetchRecordingsData();
        } else {
          this._toaster.error(res.errorMessage);
        }
        modal.close();
      });
  }

  //  File Selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (this.isEditMode) {
        this.editFile = input.files[0];
        this.selectedFiles = [];
        this.selectedFiles.push(this.editFile);
      } else {
        Array.from(input.files).forEach(file => {
          if (!this.selectedFiles.some(f => f.name === file.name)) {
            this.selectedFiles.push(file);
          } else {
            this._toaster.error("Duplicate file skipped", 2000);
          }
        });
      }
      input.value = "";
    }
  }



  removeFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
    this._toaster.success("File removed!", 1000);
  }

  //  Drag & Drop Handlers
  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragOver = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragOver = false; }
  onDrop(event: DragEvent) {
    event.preventDefault(); this.isDragOver = false;
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => {
        if (!this.selectedFiles.some(f => f.name === file.name)) {
          this.selectedFiles.push(file);
        } else {
          this._toaster.error("Duplicate file skipped", 2000);
        }
      });
    }
  }

  //  Helpers
  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  //  Pagination
  changePage(page: number) {
    this.pageNumber = page;
    this.fetchRecordingsData();
  }


  // Common reset function
  private resetModalState() {
    this.selectedFiles = [];
    this.editFile = null;
    this.isEditMode = false;
    this.selectedRecording = null;
  }

  // Toggle filter section
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Search trigger
  onSearch() {
    this.pageNumber = 1;
    this.searchTerm = this.searchText; // bind input to API payload
    this.fetchRecordingsData();
  }

  // Reset filters
  resetFilters() {
    this.searchText = "";
    this.searchTerm = "";
    this.pageNumber = 1;
    this.fetchRecordingsData();
  }
  updateSelection() {
    this.selectedRecordings = this.recordings
      .filter(r => r.selected)
      .map(r => r.id);
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.recordings.forEach(r => r.selected = checked);
    this.updateSelection();
  }

  deleteSelected() {
    if (this.selectedRecordings.length === 0) return;

    this._api.DeleteCallWithBody("Recordings/selectedCallsDelete", { recordingIds: this.selectedRecordings })
      .subscribe({
        next: (res: ResponseVM) => {
          if (res.responseCode === ResponseCode.Success) {
            this._toaster.success(res.responseMessage);
            this.fetchRecordingsData();
            this.selectedRecordings = [];
            this.recordings.forEach(r => r.selected = false);
          } else {
            this._toaster.error(res.errorMessage);
          }
        },
        error: () => {
          this._toaster.error("Failed to delete recordings");
        }
      });

  }



  analyzeSelected(aiModel: string, modelName: string, recordingIds?: number[]) {
    const ids = recordingIds && recordingIds.length ? recordingIds : this.selectedRecordings;

    if (!ids || ids.length === 0) {
      this._toaster.info('Please select at least one recording.');
      return;
    }

    const payload = {
      recordingIds: ids,
      aiModel: aiModel,
      modelName: modelName
    };

    this._api.PostCall(payload, 'Recordings/analyzeCall').subscribe(
      (response: ResponseVM) => {
        if (response.responseCode === ResponseCode.Success) {
          if (response.data) {
            this.analysisResults = response.data;
            this.analysisForms.clear();
            this.analysisResults.forEach(res => {
              this.analysisForms.push(this.buildAnalysisForm(res));
            });
            this._toaster.success('Call analyzed successfully!');

            this._modalService.open(this.AnalysisModal, { size: 'xl', scrollable: true });
          } else {
            this.analysisResults = [];
            this.analysisForms.clear();
            this._toaster.info('No analysis data returned.');
          }
        } else {
          this.analysisResults = [];
          this._toaster.error(response.responseMessage || 'Analysis failed.');
        }
      }
    );
  }

  private buildAnalysisForm(result: AnalysisResult): FormGroup {
    const a = result.analysis;
    let aiModel = '';
    let modelName = '';

    if (a?.aiModelUsed) {
      const parts = a.aiModelUsed.split('-');
      aiModel = parts[0] || '';
      modelName = parts.slice(1).join('-') || '';
    }

    return this.fb.group({
      fileName: [result.analysis.fileName || ''],
      status: [result.status || ''],
      aiModelUsed: [aiModel], 
      modelName: [modelName],
      transcript: [a?.transcript || ''],
      summary: [a?.summary || ''],
      sentiment: [a?.sentiment || ''],
      confidenceScore: [a?.confidenceScore ?? null],
      analyzedOn: [a?.analyzedOn ? new Date(a.analyzedOn).toLocaleString() : ''],
      keywords: [a?.keywords || []],
      emotions: [a?.emotions || []]
    });
  }

  get analysisFormGroups(): FormGroup[] {
    return this.analysisForms.controls as FormGroup[];
  }

  fetchAnalysedRecordings(recordingId: number) {
    this._api.GetCall(`Recordings/GetAnalyzedCall?id=${recordingId}`).subscribe((response: ResponseVM) => {
      if (response.responseCode === ResponseCode.Success) {
        if (response.data) {
          this.analysisResults = Array.isArray(response.data) ? response.data : [response.data];

          this.analysisForms.clear();
          this.analysisResults.forEach(res => {
            this.analysisForms.push(this.buildAnalysisForm(res));
          });

          this._toaster.success('Analysis fetched successfully!');
          this._modalService.open(this.AnalysisModal, { size: 'xl', scrollable: true });
        } else {
          this.analysisResults = [];
          this.analysisForms.clear();
          this._toaster.info('No analysis data returned.');
        }
      } else {
        this.analysisResults = [];
        this.analysisForms.clear();
        this._toaster.error(response.responseMessage || 'Analysis failed.');
      }
    });
  }




}
