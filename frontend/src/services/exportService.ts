import { readRecords } from './recordsStore'
import { readProfile } from './profileStore'
import { HealthRecordItem } from './recordsStore'

export async function exportHealthDataToPDF() {
  const records = readRecords()
  const profile = readProfile()
  
  // 创建PDF内容
  const content = generatePDFContent(records, profile)
  
  // 使用浏览器打印功能生成PDF
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('无法打开打印窗口')
  }
  
  printWindow.document.write(content)
  printWindow.document.close()
  
  // 等待内容加载后打印
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

function generatePDFContent(records: HealthRecordItem[], profile: any): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  const recordsByCategory = {
    report: records.filter(r => r.category === 'exam' || r.category === 'report'),
    vitals: records.filter(r => r.category === 'measure' || r.category === 'vitals'),
    symptom: records.filter(r => r.category === 'consult' || r.category === 'symptom'),
    other: records.filter(r => r.category === 'other'),
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>健康档案报告 - ${dateStr}</title>
  <style>
    @media print {
      @page {
        margin: 2cm;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #059669;
      margin-top: 30px;
      margin-bottom: 15px;
      border-left: 4px solid #059669;
      padding-left: 10px;
    }
    .header {
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      width: 120px;
      color: #666;
    }
    .record-item {
      border-left: 3px solid #e5e7eb;
      padding-left: 15px;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f3f4f6;
    }
    .record-date {
      color: #6b7280;
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .record-title {
      font-weight: bold;
      color: #111827;
      margin-bottom: 5px;
    }
    .record-type {
      color: #6b7280;
      font-size: 0.9em;
    }
    .summary {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>个人健康档案报告</h1>
    <div class="info-row">
      <span class="info-label">生成日期：</span>
      <span>${dateStr}</span>
    </div>
    <div class="info-row">
      <span class="info-label">姓名：</span>
      <span>${profile.fullName || '未设置'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">记录总数：</span>
      <span>${records.length} 条</span>
    </div>
  </div>

  ${recordsByCategory.report.length > 0 ? `
    <h2>报告类记录 (${recordsByCategory.report.length}条)</h2>
    ${recordsByCategory.report.map(r => `
      <div class="record-item">
        <div class="record-date">${r.date}</div>
        <div class="record-title">${r.summary}</div>
        <div class="record-type">${r.type}</div>
      </div>
    `).join('')}
  ` : ''}

  ${recordsByCategory.vitals.length > 0 ? `
    <h2>指标类记录 (${recordsByCategory.vitals.length}条)</h2>
    ${recordsByCategory.vitals.map(r => `
      <div class="record-item">
        <div class="record-date">${r.date}</div>
        <div class="record-title">${r.summary}</div>
        <div class="record-type">${r.type}</div>
      </div>
    `).join('')}
  ` : ''}

  ${recordsByCategory.symptom.length > 0 ? `
    <h2>症状类记录 (${recordsByCategory.symptom.length}条)</h2>
    ${recordsByCategory.symptom.map(r => `
      <div class="record-item">
        <div class="record-date">${r.date}</div>
        <div class="record-title">${r.summary}</div>
        <div class="record-type">${r.type}</div>
      </div>
    `).join('')}
  ` : ''}

  ${recordsByCategory.other.length > 0 ? `
    <h2>其他记录 (${recordsByCategory.other.length}条)</h2>
    ${recordsByCategory.other.map(r => `
      <div class="record-item">
        <div class="record-date">${r.date}</div>
        <div class="record-title">${r.summary}</div>
        <div class="record-type">${r.type}</div>
      </div>
    `).join('')}
  ` : ''}

  <div class="summary">
    <h2>报告说明</h2>
    <p>本报告由 AI 健康助手自动生成，包含您的健康档案记录摘要。</p>
    <p><strong>重要提示：</strong>本报告仅供参考，不能替代专业医疗诊断。如有健康问题，请咨询专业医生。</p>
  </div>

  <div class="footer">
    <p>AI 健康助手 - 个人健康档案报告</p>
    <p>生成时间：${now.toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>
  `
}

export async function exportHealthDataToJSON() {
  const records = readRecords()
  const profile = readProfile()
  
  const data = {
    exportDate: new Date().toISOString(),
    profile: {
      fullName: profile.fullName,
      birthday: profile.birthday,
      phone: profile.phone,
      email: profile.email,
    },
    records: records.map(r => ({
      id: r.id,
      date: r.date,
      type: r.type,
      category: r.category,
      summary: r.summary,
      fileName: r.fileName,
      fileType: r.fileType,
      // 不导出文件数据，文件太大
    })),
    totalRecords: records.length,
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `health-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
