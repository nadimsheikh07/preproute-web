import TestTable from '@/components/tests/TestTable';

export default function TestCreationPage() {
    return (
        <div className="p-5 sm:p-8">

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-[28px] font-bold tracking-[-0.025em] text-[#101828]">
                    Test Creation
                </h1>

                <p className="mt-2 text-[14px] text-[#667085]">
                    Create, manage and publish your tests.
                </p>
            </div>

            <TestTable />

        </div>
    );
}