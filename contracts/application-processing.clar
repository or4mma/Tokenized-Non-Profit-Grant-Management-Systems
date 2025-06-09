;; Application Processing Contract
;; Processes and manages grant applications

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-invalid-application (err u201))
(define-constant err-already-exists (err u202))
(define-constant err-not-found (err u203))
(define-constant err-invalid-status (err u204))

;; Data structures
(define-map grant-applications
  { application-id: uint }
  {
    applicant: principal,
    funder: principal,
    title: (string-ascii 100),
    description: (string-ascii 500),
    requested-amount: uint,
    duration-months: uint,
    category: (string-ascii 50),
    status: (string-ascii 20),
    submission-date: uint,
    review-date: uint,
    reviewer: (optional principal)
  }
)

(define-map applicant-applications
  { applicant: principal }
  { application-ids: (list 10 uint) }
)

(define-data-var next-application-id uint u1)

;; Public functions
(define-public (submit-application
  (funder principal)
  (title (string-ascii 100))
  (description (string-ascii 500))
  (requested-amount uint)
  (duration-months uint)
  (category (string-ascii 50))
)
  (let ((application-id (var-get next-application-id))
        (applicant tx-sender))
    (map-set grant-applications
      { application-id: application-id }
      {
        applicant: applicant,
        funder: funder,
        title: title,
        description: description,
        requested-amount: requested-amount,
        duration-months: duration-months,
        category: category,
        status: "submitted",
        submission-date: block-height,
        review-date: u0,
        reviewer: none
      }
    )
    (var-set next-application-id (+ application-id u1))
    (ok application-id)
  )
)

(define-public (review-application (application-id uint) (new-status (string-ascii 20)))
  (match (map-get? grant-applications { application-id: application-id })
    app-data (begin
      (asserts! (or (is-eq tx-sender contract-owner)
                   (is-eq tx-sender (get funder app-data))) err-owner-only)
      (map-set grant-applications
        { application-id: application-id }
        (merge app-data {
          status: new-status,
          review-date: block-height,
          reviewer: (some tx-sender)
        })
      )
      (ok true)
    )
    err-not-found
  )
)

(define-public (update-application-status (application-id uint) (status (string-ascii 20)))
  (match (map-get? grant-applications { application-id: application-id })
    app-data (begin
      (asserts! (is-eq tx-sender contract-owner) err-owner-only)
      (map-set grant-applications
        { application-id: application-id }
        (merge app-data { status: status })
      )
      (ok true)
    )
    err-not-found
  )
)

;; Read-only functions
(define-read-only (get-application (application-id uint))
  (map-get? grant-applications { application-id: application-id })
)

(define-read-only (get-application-status (application-id uint))
  (match (map-get? grant-applications { application-id: application-id })
    app-data (some (get status app-data))
    none
  )
)

(define-read-only (get-applications-by-status (status (string-ascii 20)))
  (ok status) ;; Simplified - in practice would filter applications
)

(define-read-only (get-next-application-id)
  (var-get next-application-id)
)
