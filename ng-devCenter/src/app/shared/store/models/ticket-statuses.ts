export const statuses:any = {
	ONHOLD: {frontend: 'On Hold', backend: 'onHold'},
	BACKLOG: {frontend: 'Backlog', backend: 'backlog'},
	SPRINT: {frontend: 'In Sprint', backend: 'inSprint'},
	INDEV: {frontend: 'In Development', backend: 'inDev'},
	PCRNEED: {frontend: 'PCR - Needed', backend: 'pcrNeeded'},
	PCRPASS: {frontend: 'PCR - Passed', backend: 'pcrPass'},
	PCRADD: {frontend: 'PCR - Added', backend: 'pcrAdd'},
	PCRCOMP: {frontend: 'PCR - Completed', backend: 'pcrCompleted'},
	CRWORK: {frontend: 'Code Review - Working', backend: 'crWorking'},
	CRFAIL: {frontend: 'Code Review - Failed', backend: 'crFail'},
	QAREADY: {frontend: 'Ready for QA', backend: 'qaReady'},
	INQA: {frontend: 'In QA', backend: 'inQa'},
	QAFAIL: {frontend: 'QA Fail', backend: 'qaFail'},
	QAPASS: {frontend: 'QA Pass', backend: 'qaPass'},
	MERGECODE: {frontend: 'Merge Code', backend: 'mergeCode'},
	MERGECONF: {frontend: 'Merge Conflict', backend: 'mergeConflict'},
	UCTREADY: {frontend: 'Ready for UCT', backend: 'uctReady'},
	INUCT: {frontend: 'In UCT', backend: 'inUct'},
	UCTFAIL: {frontend: 'UCT Fail', backend: 'uctFail'},
	UCTPASS: {frontend: 'UCT Pass', backend: 'uctPass'},
	RELEASE: {frontend: 'Ready For Release', backend: 'releaseReady'},
	REMOVEPCR: {frontend: 'Remove PCR Needed', backend: 'removePcrNeeded'},
	REMOVEPCRC: {frontend: 'Remove PCR Completed', backend: 'removePcrCompleted'},
	QAGEN: {frontend: 'Generate Crucible', backend: 'generateCrucible'}
};

export const allTransistions:Array<Object> = [
		{name: statuses.INDEV.frontend, id: statuses.INDEV.backend},
		{name: statuses.PCRNEED.frontend, id: statuses.PCRNEED.backend},
		{name: statuses.REMOVEPCR.frontend, id: statuses.REMOVEPCR.backend},
		{name: statuses.PCRPASS.frontend, id: statuses.PCRPASS.backend},
		{name: statuses.PCRCOMP.frontend, id: statuses.PCRCOMP.backend},
		{name: statuses.REMOVEPCRC.frontend, id: statuses.REMOVEPCRC.backend},
		{name: statuses.CRWORK.frontend, id: statuses.CRWORK.backend},
		{name: statuses.CRFAIL.frontend, id: statuses.CRFAIL.backend},
		{name: statuses.QAREADY.frontend, id: statuses.QAREADY.backend},
		{name: statuses.INQA.frontend, id: statuses.INQA.backend},
		{name: statuses.QAFAIL.frontend, id: statuses.QAFAIL.backend},
		{name: statuses.QAPASS.frontend, id: statuses.QAPASS.backend},
		{name: statuses.MERGECODE.frontend, id: statuses.MERGECODE.backend},
		{name: statuses.MERGECONF.frontend, id: statuses.MERGECONF.backend},
		{name: statuses.INUCT.frontend, id: statuses.INUCT.backend},
		{name: statuses.UCTPASS.frontend, id: statuses.UCTPASS.backend},
		{name: statuses.UCTFAIL.frontend, id: statuses.UCTFAIL.backend},
		{name: statuses.UCTREADY.frontend, id: statuses.UCTREADY.backend},
		{name: statuses.RELEASE.frontend, id: statuses.RELEASE.backend},
		{name: statuses.QAGEN.frontend, id: statuses.QAGEN.backend}
	];