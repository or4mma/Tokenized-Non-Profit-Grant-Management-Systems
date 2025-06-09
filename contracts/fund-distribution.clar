;; Fund Distribution Contract
;; Manages the distribution of grant funds to approved projects

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-insufficient-funds (err u301))
(define-constant err-invalid-grant (err u302))
(define-constant err-already-distributed (err u303))
(define-constant err-not-approved (err u304))

;; Data structures
(define-map grant-funds
  { grant-id: uint }
  {
    funder: principal,
    recipient: principal,
    total-amount: uint,
    distributed-amount: uint,
    remaining-amount: uint,
    distribution-schedule: (list 12 uint),
    current-milestone: uint,
    status: (string-ascii 20),
    creation-date: uint
  }
)

(define-map fund-deposits
  { funder: principal }
  { total-deposited: uint, available-balance: uint }
)

(define-map distribution-history
  { grant-id: uint, milestone: uint }
  {
    amount: uint,
    distribution-date: uint,
    recipient: principal,
    transaction-hash: (string-ascii 64)
  }
)

(define-data-var next-grant-id uint u1)

;; Public functions
(define-public (deposit-funds (amount uint))
  (let ((funder tx-sender))
    (match (map-get? fund-deposits { funder: funder })
      existing-deposit (map-set fund-deposits
        { funder: funder }
        {
          total-deposited: (+ (get total-deposited existing-deposit) amount),
          available-balance: (+ (get available-balance existing-deposit) amount)
        }
      )
      (map-set fund-deposits
        { funder: funder }
        {
          total-deposited: amount,
          available-balance: amount
        }
      )
    )
    (ok true)
  )
)

(define-public (create-grant-fund
  (recipient principal)
  (total-amount uint)
  (distribution-schedule (list 12 uint))
)
  (let ((grant-id (var-get next-grant-id))
        (funder tx-sender))
    (match (map-get? fund-deposits { funder: funder })
      deposit-info (begin
        (asserts! (>= (get available-balance deposit-info) total-amount) err-insufficient-funds)
        (map-set grant-funds
          { grant-id: grant-id }
          {
            funder: funder,
            recipient: recipient,
            total-amount: total-amount,
            distributed-amount: u0,
            remaining-amount: total-amount,
            distribution-schedule: distribution-schedule,
            current-milestone: u0,
            status: "active",
            creation-date: block-height
          }
        )
        (map-set fund-deposits
          { funder: funder }
          (merge deposit-info {
            available-balance: (- (get available-balance deposit-info) total-amount)
          })
        )
        (var-set next-grant-id (+ grant-id u1))
        (ok grant-id)
      )
      err-insufficient-funds
    )
  )
)

(define-public (distribute-milestone-payment (grant-id uint))
  (match (map-get? grant-funds { grant-id: grant-id })
    grant-data (let ((current-milestone (get current-milestone grant-data))
                     (schedule (get distribution-schedule grant-data)))
      (asserts! (< current-milestone (len schedule)) err-invalid-grant)
      (let ((payment-amount (unwrap-panic (element-at schedule current-milestone))))
        (map-set grant-funds
          { grant-id: grant-id }
          (merge grant-data {
            distributed-amount: (+ (get distributed-amount grant-data) payment-amount),
            remaining-amount: (- (get remaining-amount grant-data) payment-amount),
            current-milestone: (+ current-milestone u1)
          })
        )
        (map-set distribution-history
          { grant-id: grant-id, milestone: current-milestone }
          {
            amount: payment-amount,
            distribution-date: block-height,
            recipient: (get recipient grant-data),
            transaction-hash: "pending"
          }
        )
        (ok payment-amount)
      )
    )
    err-invalid-grant
  )
)

;; Read-only functions
(define-read-only (get-grant-fund (grant-id uint))
  (map-get? grant-funds { grant-id: grant-id })
)

(define-read-only (get-funder-balance (funder principal))
  (map-get? fund-deposits { funder: funder })
)

(define-read-only (get-distribution-history (grant-id uint) (milestone uint))
  (map-get? distribution-history { grant-id: grant-id, milestone: milestone })
)

(define-read-only (get-next-grant-id)
  (var-get next-grant-id)
)
